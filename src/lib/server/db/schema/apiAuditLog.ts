import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';
import user from './user';

const apiAuditLog = sqliteTable('api_audit_log', {
	id: text('id').primaryKey().$defaultFn(generateId),
	// Deliberately no FK to apiKey.id: the audit trail must survive a key being revoked
	// (deleted), which is exactly the moment someone is most likely to want to review it.
	apiKeyId: text('api_key_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	method: text('method').notNull(),
	path: text('path').notNull(),
	action: text('action').notNull(),
	statusCode: integer('status_code').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

export const apiAuditLogRelations = relations(apiAuditLog, ({ one }) => ({
	user: one(user, { fields: [apiAuditLog.userId], references: [user.id] })
}));

export default apiAuditLog;
