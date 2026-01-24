import { and, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';

import type { Transaction } from '$lib/types';

import { transaction } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof transaction, Transaction>({
	tableName: 'transaction',
	defaultRelations: { category: true, user: true },
	defaultOrderBy: [desc(transaction.date)]
});

export const transactionQueries = {
	...baseBuilder,

	// Find by date range (most common pattern for transactions)
	findByDateRange: async (startDate: string, endDate: string): Promise<Transaction[]> => {
		return baseBuilder.findAll({
			where: and(
				sql`date(${transaction.date}) >= date(${startDate})`,
				sql`date(${transaction.date}) <= date(${endDate})`
			)
		});
	},

	// Find by month/year (convenience method)
	findByMonth: async (month: number, year: number): Promise<Transaction[]> => {
		const paddedMonth = String(month).padStart(2, '0');
		const startDate = `${year}-${paddedMonth}-01`;
		const lastDay = new Date(year, month, 0).getDate();
		const endDate = `${year}-${paddedMonth}-${lastDay}`;
		return transactionQueries.findByDateRange(startDate, endDate);
	},

	// Find by category
	findByCategory: async (
		categoryId: string,
		dateRange?: { start: string; end: string }
	): Promise<Transaction[]> => {
		const where = dateRange
			? and(
					eq(transaction.categoryId, categoryId),
					sql`date(${transaction.date}) >= date(${dateRange.start})`,
					sql`date(${transaction.date}) <= date(${dateRange.end})`
				)
			: eq(transaction.categoryId, categoryId);

		return baseBuilder.findAll({ where });
	},

	// Find by date range excluding a specific category (for business receipts)
	findByDateRangeExcludingCategory: async (
		startDate: string,
		endDate: string,
		excludeCategoryId: string,
		requireGst: boolean = false
	): Promise<Transaction[]> => {
		const conditions = [
			sql`date(${transaction.date}) >= date(${startDate})`,
			sql`date(${transaction.date}) <= date(${endDate})`,
			ne(transaction.categoryId, excludeCategoryId)
		];

		if (requireGst) {
			conditions.push(isNotNull(transaction.gstAmount), sql`${transaction.gstAmount} > 0`);
		}

		return baseBuilder.findAll({ where: and(...conditions) });
	}
};
