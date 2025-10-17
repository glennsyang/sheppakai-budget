import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../utils';
import category from './category';
import user from './user';

const expense = sqliteTable('expenses', {
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

export const expenseRelations = relations(expense, ({ one }) => ({
	category: one(category, { fields: [expense.categoryId], references: [category.id] }),
	user: one(user, { fields: [expense.userId], references: [user.id] })
}));

export default expense;
