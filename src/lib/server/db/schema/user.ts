import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';
import budget from './budget';
import expense from './transaction';

const user = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(generateId),
	email: text('email').notNull().unique(),
	firstName: text('firstName'),
	lastName: text('lastName'),
	hashed_password: text('hashed_password').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default(sql`(current_timestamp)`),
	updatedAt: text('updated_at')
		.notNull()
		.default(sql`(current_timestamp)`)
});

export const userRelations = relations(user, ({ many }) => ({
	expense: many(expense),
	budget: many(budget)
}));

export default user;
