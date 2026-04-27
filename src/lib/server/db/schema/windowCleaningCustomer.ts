import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import user from './user';

const windowCleaningCustomer = sqliteTable('window_cleaning_customers', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull(),
	address: text('address').notNull(),
	city: text('city').notNull(),
	unitNumber: text('unit_number'),
	buzzerNumber: text('buzzer_number'),
	phoneNumber: text('phone_number'),
	notes: text('notes'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by').references(() => user.id),
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

export const windowCleaningCustomerRelations = relations(windowCleaningCustomer, ({ one }) => ({
	user: one(user, { fields: [windowCleaningCustomer.userId], references: [user.id] })
}));

export default windowCleaningCustomer;
