import { and, desc, eq, sql } from 'drizzle-orm';

import type { WindowCleaningJob } from '$lib/types';

import { windowCleaningJob } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof windowCleaningJob, WindowCleaningJob>({
	tableName: 'windowCleaningJob',
	defaultRelations: { customer: true, user: true },
	defaultOrderBy: [desc(windowCleaningJob.jobDate)]
});

export const windowCleaningJobQueries = {
	...baseBuilder,

	// Find all jobs for a user (across all customers), date-sorted
	findAll: async (userId: string): Promise<WindowCleaningJob[]> => {
		return baseBuilder.findAll({
			where: eq(windowCleaningJob.userId, userId)
		});
	},

	// Find jobs for a specific customer
	findByCustomer: async (customerId: string): Promise<WindowCleaningJob[]> => {
		return baseBuilder.findAll({
			where: eq(windowCleaningJob.customerId, customerId)
		});
	},

	// Find jobs for a user within a month/year
	findByMonth: async (
		userId: string,
		month: number,
		year: number
	): Promise<WindowCleaningJob[]> => {
		const paddedMonth = String(month).padStart(2, '0');
		const startDate = `${year}-${paddedMonth}-01`;
		const lastDay = new Date(year, month, 0).getDate();
		const endDate = `${year}-${paddedMonth}-${String(lastDay).padStart(2, '0')}`;

		return baseBuilder.findAll({
			where: and(
				eq(windowCleaningJob.userId, userId),
				sql`date(${windowCleaningJob.jobDate}) >= ${startDate}`,
				sql`date(${windowCleaningJob.jobDate}) <= ${endDate}`
			)
		});
	},

	// Find jobs for a user within a year
	findByYear: async (userId: string, year: number): Promise<WindowCleaningJob[]> => {
		const startDate = `${year}-01-01`;
		const endDate = `${year}-12-31`;
		return baseBuilder.findAll({
			where: and(
				eq(windowCleaningJob.userId, userId),
				sql`date(${windowCleaningJob.jobDate}) >= ${startDate}`,
				sql`date(${windowCleaningJob.jobDate}) <= ${endDate}`
			)
		});
	}
};
