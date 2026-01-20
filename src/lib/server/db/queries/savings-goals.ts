import { asc } from 'drizzle-orm';

import type { SavingsGoal } from '$lib/types';

import { savingsGoal } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof savingsGoal, SavingsGoal>({
	tableName: 'savingsGoal',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(savingsGoal.name)]
});

export const savingsGoalQueries = {
	...baseBuilder
};
