import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import budget from './budget';
import expense from './transaction';

const user = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(generateId),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	name: text('name'),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const userRelations = relations(user, ({ many }) => ({
	expense: many(expense),
	budget: many(budget)
}));

export default user;
