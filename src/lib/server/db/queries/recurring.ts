import { asc } from 'drizzle-orm';

import { recurring } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder({
	tableName: 'recurring',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(recurring.merchant)]
});

export const recurringQueries = {
	...baseBuilder
};
