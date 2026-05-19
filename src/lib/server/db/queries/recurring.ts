import type { Recurring } from '$lib/types';
import { asc } from 'drizzle-orm';

import { recurring } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof recurring, Recurring>({
	tableName: 'recurring',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(recurring.merchant)]
});

export const recurringQueries = {
	...baseBuilder
};
