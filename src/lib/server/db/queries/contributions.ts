import { asc, eq } from 'drizzle-orm';

import type { Contribution } from '$lib/types';

import { contribution } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof contribution, Contribution>({
	tableName: 'contribution',
	defaultRelations: { savingsGoal: true },
	defaultOrderBy: [asc(contribution.date)]
});

export const contributionQueries = {
	...baseBuilder,

	// Find by savings goal
	findByGoal: async (goalId: string): Promise<Contribution[]> => {
		return baseBuilder.findAll({
			where: eq(contribution.goalId, goalId)
		});
	}
};
