import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

// Helper function to generate a UUID for new records
const generateId = () => randomUUID();

export const users = sqliteTable('users', {
	id: text('id').primaryKey().$defaultFn(generateId),
	email: text('email').notNull().unique(),
	firstName: text('firstName'),
	lastName: text('lastName'),
	hashed_password: text('hashed_password').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: text('created_by'),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: text('updated_by')
});

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull(),
	description: text('description'),
	user_id: text('user_id').references(() => users.id),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: text('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: text('updated_by').references(() => users.id)
});

export const expenses = sqliteTable('expenses', {
	id: text('id').primaryKey().$defaultFn(generateId),
	user_id: text('user_id').references(() => users.id),
	category_id: text('category_id')
		.references(() => categories.id)
		.notNull(),
	amount: real('amount').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: text('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: text('updated_by').references(() => users.id)
});

export const income = sqliteTable('income', {
	id: text('id').primaryKey().$defaultFn(generateId),
	user_id: text('user_id').references(() => users.id),
	amount: real('amount').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: text('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: text('updated_by').references(() => users.id)
});
