import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import category from './category';
import user from './user';

const transaction = sqliteTable('transactions', {
	id: text('id').primaryKey().$defaultFn(generateId),
	amount: real('amount').notNull(),
	payee: text('payee').notNull(),
	notes: text('notes').notNull(),
	date: text('date').notNull(),
	categoryId: text('category_id')
		.notNull()
		.references(() => category.id),
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

export const transactionRelations = relations(transaction, ({ one }) => ({
	category: one(category, { fields: [transaction.categoryId], references: [category.id] }),
	user: one(user, { fields: [transaction.userId], references: [user.id] })
}));

export default transaction;
