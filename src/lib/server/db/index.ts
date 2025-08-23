import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const connection = new Database(env.DATABASE_URL);

export const db = drizzle(connection, { schema, logger: true });

export type db = typeof db;

export default db;
