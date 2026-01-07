import { relations, sql } from 'drizzle-orm';
import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import savingsGoal from './savingsGoal';
import user from './user';

const contribution = sqliteTable('contributions', {
	id: text('id').primaryKey().$defaultFn(generateId),
	goalId: text('goal_id')
		.notNull()
		.references(() => savingsGoal.id),
	amount: real('amount').notNull(),
	date: text('date').notNull(),
	description: text('description'),
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

export const contributionRelations = relations(contribution, ({ one }) => ({
	goal: one(savingsGoal, { fields: [contribution.goalId], references: [savingsGoal.id] }),
	user: one(user, { fields: [contribution.userId], references: [user.id] })
}));

export default contribution;
