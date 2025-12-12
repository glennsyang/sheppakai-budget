import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { generateId } from '../utils';
import { sql } from 'drizzle-orm';
import { user } from '../schema';

const income = sqliteTable('income', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull().default(''),
	description: text('description').notNull(),
	amount: real('amount').notNull(),
	date: text('date').notNull().default(''),
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

export default income;
