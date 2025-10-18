import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../utils';
import user from './user';

const recurring = sqliteTable('recurring', {
	id: text('id').primaryKey().$defaultFn(generateId),
	merchant: text('merchant').notNull(),
	description: text('description').notNull(),
	cadence: text('cadence').notNull(),
	amount: real('amount').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	createdBy: text('created_by')
		.notNull()
		.references(() => user.id),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	updatedBy: text('updated_by')
		.notNull()
		.references(() => user.id)
});

export const recurringRelations = relations(recurring, ({ one }) => ({
	user: one(user, { fields: [recurring.userId], references: [user.id] })
}));

export default recurring;
