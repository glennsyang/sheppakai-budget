import type { Savings } from '$lib/types';
import { asc, sum } from 'drizzle-orm';

import { getDb } from '../index';
import { savings } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof savings, Savings>({
	tableName: 'savings',
	defaultRelations: { user: true },
	defaultOrderBy: [asc(savings.title)]
});

export const savingsQueries = {
	...baseBuilder,

	// Sum of all savings account balances (a running total, not date-scoped).
	getTotal: async (): Promise<number> => {
		const [row] = await getDb()
			.select({ total: sum(savings.amount) })
			.from(savings);
		return Number(row?.total ?? 0);
	}
};
