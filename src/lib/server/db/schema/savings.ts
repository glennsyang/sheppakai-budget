import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import user from './user';

const savings = sqliteTable('savings', {
	id: text('id').primaryKey().$defaultFn(generateId),
	title: text('title').notNull(),
	description: text('description'),
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

export const savingsRelations = relations(savings, ({ one }) => ({
	user: one(user, { fields: [savings.userId], references: [user.id] })
}));

export default savings;
