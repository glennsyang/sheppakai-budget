import { and, asc, sql } from 'drizzle-orm';

import type { Income } from '$lib/types';

import { income } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof income, Income>({
	tableName: 'income',
	defaultOrderBy: [asc(income.date)]
});

export const incomeQueries = {
	...baseBuilder,

	// Find by date range (most common pattern for income)
	findByDateRange: async (startDate: string, endDate: string): Promise<Income[]> => {
		return baseBuilder.findAll({
			where: and(
				sql`date(${income.date}) >= date(${startDate})`,
				sql`date(${income.date}) <= date(${endDate})`
			)
		});
	},

	// Find by month/year (convenience method)
	findByMonth: async (month: number, year: number): Promise<Income[]> => {
		const paddedMonth = String(month).padStart(2, '0');
		const startDate = `${year}-${paddedMonth}-01`;
		const lastDay = new Date(year, month, 0).getDate();
		const endDate = `${year}-${paddedMonth}-${lastDay}`;
		return incomeQueries.findByDateRange(startDate, endDate);
	}
};
