import { desc, eq } from 'drizzle-orm';

import { contribution } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder({
	tableName: 'contribution',
	defaultRelations: { goal: true, user: true },
	defaultOrderBy: [desc(contribution.date)]
});

export const contributionQueries = {
	...baseBuilder,

	// Find all contributions for one goal, without relations
	findByGoalId: async (goalId: string) => {
		return baseBuilder.findAll({
			where: eq(contribution.goalId, goalId),
			with: {}
		});
	}
};
