import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
	if (!_db) {
		if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

		const connection = new Database(env.DATABASE_URL);
		_db = drizzle(connection, { schema, logger: true });
	}

	return _db;
}

export type DB = ReturnType<typeof getDb>;

export default getDb;
