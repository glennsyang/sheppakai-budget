import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb } from './index';

let migrated = false;

export function ensureMigrated() {
	if (!migrated) {
		console.log('Running database migrations...');
		migrate(getDb(), { migrationsFolder: 'src/lib/server/db/migrations' });
		migrated = true;
		console.log('Database migrations complete');
	}
}
