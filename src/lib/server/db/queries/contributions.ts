import { desc } from 'drizzle-orm';

import { contribution } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder({
	tableName: 'contribution',
	defaultRelations: { goal: true, user: true },
	defaultOrderBy: [desc(contribution.date)]
});

export const contributionQueries = {
	...baseBuilder
};
