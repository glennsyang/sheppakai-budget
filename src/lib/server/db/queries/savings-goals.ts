import { asc, eq, ne } from 'drizzle-orm';

import { savingsGoal } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder({
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
	},

	// Find archived goals only (admin use)
	findArchived: async () => {
		return baseBuilder.findAll({
			where: eq(savingsGoal.status, 'archived')
		});
	}
};
