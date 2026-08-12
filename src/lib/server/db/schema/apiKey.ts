import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';
import user from './user';

// Mirrors the field set required by the `@better-auth/api-key` plugin's `apikey` model
// (see node_modules/@better-auth/api-key/dist/index.d.mts). Table name and every field
// name below must match the plugin's expectations exactly, since it queries this table
// by these names via the drizzle adapter's schema map in auth.ts.
const apiKey = sqliteTable('apikey', {
	id: text('id').primaryKey().$defaultFn(generateId),
	configId: text('config_id').notNull().default('default'),
	name: text('name'),
	start: text('start'),
	prefix: text('prefix'),
	key: text('key').notNull().unique(),
	referenceId: text('reference_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	refillInterval: integer('refill_interval'),
	refillAmount: integer('refill_amount'),
	lastRefillAt: integer('last_refill_at', { mode: 'timestamp' }),
	enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
	rateLimitEnabled: integer('rate_limit_enabled', { mode: 'boolean' }).notNull().default(true),
	rateLimitTimeWindow: integer('rate_limit_time_window'),
	rateLimitMax: integer('rate_limit_max'),
	requestCount: integer('request_count').notNull().default(0),
	remaining: integer('remaining'),
	lastRequest: integer('last_request', { mode: 'timestamp' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }),
	permissions: text('permissions'),
	metadata: text('metadata'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const apiKeyRelations = relations(apiKey, ({ one }) => ({
	user: one(user, {
		fields: [apiKey.referenceId],
		references: [user.id]
	})
}));

export default apiKey;
