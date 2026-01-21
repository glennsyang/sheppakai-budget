import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import user from './user';

export const savingsGoalStatusEnum = ['active', 'completed', 'paused', 'archived'] as const;
export type SavingsGoalStatus = (typeof savingsGoalStatusEnum)[number];

const savingsGoal = sqliteTable('savings_goals', {
	id: text('id').primaryKey().$defaultFn(generateId),
	name: text('name').notNull(),
	description: text('description'),
	targetAmount: real('target_amount').notNull(),
	targetDate: text('target_date'),
	status: text('status', { enum: savingsGoalStatusEnum }).notNull().default('active'),
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

export const savingsGoalRelations = relations(savingsGoal, ({ one }) => ({
	user: one(user, { fields: [savingsGoal.userId], references: [user.id] })
}));

export default savingsGoal;
