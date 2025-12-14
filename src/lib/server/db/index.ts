import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
	if (!_db) {
		if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

		// Extract file path from DATABASE_URL (remove 'file://' prefix if present)
		const dbPath = env.DATABASE_URL.replace(/^file:\/\//, '');

		// Ensure the directory exists
		const dir = dirname(dbPath);
		mkdirSync(dir, { recursive: true });

		const connection = new Database(dbPath);
		_db = drizzle(connection, { schema, logger: true });
	}

	return _db;
}

export type DB = ReturnType<typeof getDb>;

export default getDb;
