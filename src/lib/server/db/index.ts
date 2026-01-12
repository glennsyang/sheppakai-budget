import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

import { env } from '$env/dynamic/private';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
	if (!_db) {
		// Fallback to a temporary database during build time when DATABASE_URL is not available
		const dbUrl = env.DATABASE_URL || 'file:///tmp/build.db';

		// Extract file path from DATABASE_URL (remove 'file://' prefix if present)
		const dbPath = dbUrl.replace(/^file:\/\//, '');

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
