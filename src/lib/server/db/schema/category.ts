import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../utils';
import { sql } from 'drizzle-orm';
import { user } from '../schema';

const category = sqliteTable('category', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull(),
	description: text('description').notNull(),
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

export default category;
