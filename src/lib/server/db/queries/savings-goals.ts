import { asc, ne } from 'drizzle-orm';

import type { SavingsGoal } from '$lib/types';

import { savingsGoal } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof savingsGoal, SavingsGoal>({
	tableName: 'savingsGoal',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(savingsGoal.name)]
});

export const savingsGoalQueries = {
	...baseBuilder,
	findAll: async (options?: Parameters<typeof baseBuilder.findAll>[0]) => {
		return baseBuilder.findAll({
			...options,
			where: ne(savingsGoal.status, 'archived')
		});
	}
};
