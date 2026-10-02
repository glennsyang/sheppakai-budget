import type { Budget } from '$lib/types';
import { padMonth } from '$lib/utils/dates';
import { and, asc, eq, sql } from 'drizzle-orm';

import { budget } from '../schema';
import { createQueryBuilder } from './factory';

type MonthYear = { month: string; year: string };

const baseBuilder = createQueryBuilder({
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

	// Find all budgets for a year (for in-memory aggregation)
	findByYear: async (year: number): Promise<Budget[]> => {
		return baseBuilder.findAll({
			where: eq(budget.year, year.toString())
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
	},

	// Find all budgets between two months inclusive, oldest first (budget history chart).
	// Month must be zero-padded so the 'YYYY-MM' strings compare in calendar order.
	findHistory: async (start: MonthYear, end: MonthYear): Promise<Budget[]> => {
		return baseBuilder.findAll({
			where: and(
				sql`(${budget.year} || '-' || ${budget.month}) >= ${start.year + '-' + start.month}`,
				sql`(${budget.year} || '-' || ${budget.month}) <= ${end.year + '-' + end.month}`
			),
			orderBy: [asc(budget.year), asc(budget.month)]
		});
	}
};
