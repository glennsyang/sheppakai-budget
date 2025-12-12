import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { getDb } from '.';

migrate(getDb(), { migrationsFolder: 'src/lib/server/db/migrations' });
