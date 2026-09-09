// Standalone migration runner used at container boot (see start.sh).
//
// Uses drizzle-orm's migrator (a runtime dependency) instead of the drizzle-kit
// CLI, so drizzle-kit can stay a devDependency and be pruned from the production
// image. drizzle-orm's migrator reads the same meta/_journal.json and tracks
// applied migrations in the same __drizzle_migrations table that drizzle-kit
// writes, so previously-applied migrations are not re-run.
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

// Extract file path from DATABASE_URL (remove 'file://' prefix if present),
// matching the parsing in src/lib/server/db/index.ts.
const dbPath = DATABASE_URL.replace(/^file:\/\//, '');

const dir = dirname(dbPath);
mkdirSync(dir, { recursive: true });

const migrationsFolder = resolve(
	dirname(fileURLToPath(import.meta.url)),
	'../src/lib/server/db/migrations'
);

console.log(`Applying migrations to ${dbPath} from ${migrationsFolder}`);

const connection = new Database(dbPath);
try {
	// Disable FK enforcement for the duration of the migration batch.
	//
	// drizzle-orm's migrator wraps the whole batch in a single BEGIN/COMMIT, and
	// SQLite treats `PRAGMA foreign_keys` as a no-op inside a transaction. So the
	// `PRAGMA foreign_keys=OFF` that drizzle-kit emits at the top of a table-rebuild
	// migration (e.g. 0015_strange_alice) never takes effect here. Combined with
	// better-sqlite3 v12 defaulting foreign_keys=ON, `DROP TABLE` in a rebuild would
	// then either fail the FK check or fire ON DELETE CASCADE and wipe child rows
	// (sessions, accounts, ...). Setting it on the connection *before* migrate()
	// opens its transaction is the only place the pragma actually applies, and it
	// mirrors what `drizzle-kit migrate` itself does.
	connection.pragma('foreign_keys = OFF');
	migrate(drizzle(connection), { migrationsFolder });
	connection.pragma('foreign_keys = ON');

	// Surface any referential integrity the rebuilds left broken instead of failing
	// silently later at runtime.
	const fkViolations = connection.pragma('foreign_key_check');
	if (fkViolations.length > 0) {
		console.error('foreign_key_check found violations after migration:', fkViolations);
		throw new Error(
			`Post-migration foreign_key_check failed with ${fkViolations.length} violation(s)`
		);
	}
} finally {
	connection.close();
}

console.log('Migrations applied successfully');
