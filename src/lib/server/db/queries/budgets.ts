import { and, eq } from 'drizzle-orm';

import type { Budget } from '$lib/types';
import { padMonth } from '$lib/utils/dates';

import { budget } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof budget, Budget>({
	tableName: 'budget',
	defaultRelations: { category: true, user: true }
});

export const budgetQueries = {
	...baseBuilder,

	// Find by month/year (most common pattern for budgets)
	findByMonthYear: async (month: number, year: number): Promise<Budget[]> => {
		return baseBuilder.findAll({
			where: and(eq(budget.year, year.toString()), eq(budget.month, padMonth(month)))
		});
	},

	// Find by category and month/year
	findByCategoryAndMonth: async (
		categoryId: string,
		month: number,
		year: number
	): Promise<Budget[]> => {
		return baseBuilder.findAll({
			where: and(
				eq(budget.categoryId, categoryId),
				eq(budget.year, year.toString()),
				eq(budget.month, padMonth(month))
			)
		});
	}
};
