import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	firstName: text('firstName'),
	lastName: text('lastName'),
	hashed_password: text('hashed_password').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: integer('created_by'),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: integer('updated_by')
});

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	description: text('description'),
	user_id: integer('user_id').references(() => users.id),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: integer('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: integer('updated_by').references(() => users.id)
});

export const expenses = sqliteTable('expenses', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id').references(() => users.id),
	category_id: integer('category_id').references(() => categories.id),
	amount: real('amount').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: integer('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: integer('updated_by').references(() => users.id)
});

export const income = sqliteTable('income', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	user_id: integer('user_id').references(() => users.id),
	amount: real('amount').notNull(),
	description: text('description'),
	date: text('date').notNull(),
	created_at: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
	created_by: integer('created_by').references(() => users.id),
	updated_at: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
	updated_by: integer('updated_by').references(() => users.id)
});
