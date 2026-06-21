import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import { DATABASE_URL, NODE_ENV } from '$app/env/private';
import { logger } from '$lib/server/logger';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
	if (!_db) {
		// Extract file path from DATABASE_URL (remove 'file://' prefix if present)
		const dbPath = DATABASE_URL.replace(/^file:\/\//, '');

		// Ensure the directory exists
		const dir = dirname(dbPath);
		mkdirSync(dir, { recursive: true });

		const connection = new Database(dbPath);
		// Disable SQL query logging in production to prevent sensitive auth values
		// (access_token, refresh_token, id_token, password) from leaking into logs.
		const enableQueryLogging = NODE_ENV !== 'production';
		_db = drizzle(connection, { schema, logger: enableQueryLogging });
	}

	return _db;
}

// --- Graceful shutdown for DB connection (if needed) ---
// Note: better-sqlite3 doesn't have a built-in close method on the connection object,
// but if you need to perform any cleanup, you can do it here.
const shutdown = () => {
	if (_db) {
		logger.info('Closing SQLite connection');
		_db.$client.close(); // Closes the better-sqlite3 connection safely
		process.exit(0);
	}
	process.exit(0);
};

// Listen for Fly.io termination signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
