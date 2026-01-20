import { asc } from 'drizzle-orm';

import type { Savings } from '$lib/types';

import { savings } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof savings, Savings>({
	tableName: 'savings',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(savings.title)]
});

export const savingsQueries = {
	...baseBuilder
};
