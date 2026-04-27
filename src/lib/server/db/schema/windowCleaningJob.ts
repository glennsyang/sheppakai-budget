import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import user from './user';
import windowCleaningCustomer from './windowCleaningCustomer';

const windowCleaningJob = sqliteTable('window_cleaning_jobs', {
	id: text('id').primaryKey().$defaultFn(generateId),
	customerId: text('customer_id')
		.notNull()
		.references(() => windowCleaningCustomer.id),
	jobDate: text('job_date').notNull(),
	jobTime: text('job_time'),
	amountCharged: real('amount_charged').notNull(),
	tip: real('tip').notNull().default(0),
	durationHours: real('duration_hours'),
	notes: text('notes'),
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

export const windowCleaningJobRelations = relations(windowCleaningJob, ({ one }) => ({
	customer: one(windowCleaningCustomer, {
		fields: [windowCleaningJob.customerId],
		references: [windowCleaningCustomer.id]
	}),
	user: one(user, { fields: [windowCleaningJob.userId], references: [user.id] })
}));

export default windowCleaningJob;
