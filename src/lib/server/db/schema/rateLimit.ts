import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Only used when rateLimit.storage is 'database' (production — see auth.ts).
// Shape mirrors better-auth's built-in rateLimit model exactly: id + key/count/
// lastRequest and nothing else. Better-auth populates only these fields on
// insert, so this table must not add extra NOT NULL columns (no created_at/
// updated_at, no generated id).
const rateLimit = sqliteTable('rate_limit', {
	id: text('id').primaryKey(),
	key: text('key').notNull().unique(),
	count: integer('count').notNull(),
	lastRequest: integer('last_request').notNull() // ms epoch; better-auth treats it as a plain number
});

export default rateLimit;
