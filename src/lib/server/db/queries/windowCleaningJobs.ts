import type { WindowCleaningJob } from '$lib/types';
import { and, desc, eq, max, sql } from 'drizzle-orm';

import { getDb } from '../index';
import { windowCleaningJob } from '../schema';
import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof windowCleaningJob, WindowCleaningJob>({
	tableName: 'windowCleaningJob',
	defaultRelations: { customer: true, user: true },
	defaultOrderBy: [desc(windowCleaningJob.jobDate)]
});

export const windowCleaningJobQueries = {
	...baseBuilder,

	// Find all jobs across all customers, date-sorted
	findAll: async (): Promise<WindowCleaningJob[]> => {
		return baseBuilder.findAll();
	},

	// Aggregated per-customer stats via a single GROUP BY query
	getStatsPerCustomer: async (): Promise<
		{ customerId: string; totalEarned: number; lastJobDate: string | null }[]
	> => {
		const db = getDb();
		return db
			.select({
				customerId: windowCleaningJob.customerId,
				totalEarned: sql<number>`coalesce(sum(${windowCleaningJob.amountCharged} + ${windowCleaningJob.tip}), 0)`,
				lastJobDate: max(windowCleaningJob.jobDate)
			})
			.from(windowCleaningJob)
			.groupBy(windowCleaningJob.customerId);
	},

	// Find jobs for a specific customer
	findByCustomer: async (customerId: string): Promise<WindowCleaningJob[]> => {
		return baseBuilder.findAll({
			where: eq(windowCleaningJob.customerId, customerId)
		});
	},

	// Find jobs within a month/year
	findByMonth: async (month: number, year: number): Promise<WindowCleaningJob[]> => {
		const paddedMonth = String(month).padStart(2, '0');
		const startDate = `${year}-${paddedMonth}-01`;
		const lastDay = new Date(year, month, 0).getDate();
		const endDate = `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`;

		return baseBuilder.findAll({
			where: and(
				sql`date(${windowCleaningJob.jobDate}) >= date(${startDate})`,
				sql`date(${windowCleaningJob.jobDate}) <= date(${endDate})`
			)
		});
	},

	// Find jobs within a year
	findByYear: async (year: number): Promise<WindowCleaningJob[]> => {
		const safeYear = Math.trunc(year);
		if (!Number.isFinite(safeYear) || safeYear < 1 || safeYear > 9999) {
			throw new Error(`Invalid year: ${year}`);
		}
		const startDate = `${safeYear}-01-01`;
		const endDate = `${safeYear}-12-31`;
		return baseBuilder.findAll({
			where: and(
				sql`date(${windowCleaningJob.jobDate}) >= date(${startDate})`,
				sql`date(${windowCleaningJob.jobDate}) <= date(${endDate})`
			)
		});
	}
};
