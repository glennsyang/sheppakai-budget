import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../utils';
import user from './user';
import category from './category';

const income = sqliteTable('income', {
	id: text('id').primaryKey().$defaultFn(generateId),
	amount: real('amount').notNull(),
	description: text('description').notNull(),
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

export const incomeRelations = relations(income, ({ one }) => ({
	user: one(user, { fields: [income.userId], references: [user.id] }),
	category: one(category, { fields: [income.categoryId], references: [category.id] })
}));

export default income;
