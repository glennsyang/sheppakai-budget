import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '.';

migrate(db, { migrationsFolder: 'src/lib/server/db/migrations' });
