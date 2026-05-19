import { windowCleaningCustomerSchema, windowCleaningJobSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { createAction, updateAction } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { windowCleaningCustomerQueries, windowCleaningJobQueries } from '$lib/server/db/queries';
import { windowCleaningCustomer, windowCleaningJob } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import type { WindowCleaningJob } from '$lib/types';
import { formatDateForStorage, getCurrentUTCTimestamp } from '$lib/utils/dates';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [customers, allJobs, customerStats] = await Promise.all([
		windowCleaningCustomerQueries.findAll(),
		windowCleaningJobQueries.findAll(),
		windowCleaningJobQueries.getStatsPerCustomer()
	]);

	// Build O(1) lookup maps — avoids O(customers × jobs) filter loops
	const statsMap = new Map(customerStats.map((s) => [s.customerId, s]));
	const jobsMap = allJobs.reduce((acc, job) => {
		const list = acc.get(job.customerId);
		if (list) {
			list.push(job);
		} else {
			acc.set(job.customerId, [job]);
		}
		return acc;
	}, new Map<string, WindowCleaningJob[]>());

	const customersWithStats = customers.map((customer) => {
		const stats = statsMap.get(customer.id);
		const jobs = jobsMap.get(customer.id) ?? [];
		return {
			...customer,
			jobs,
			totalEarned: stats?.totalEarned ?? 0,
			lastJobDate: stats?.lastJobDate ?? null
		};
	});

	// Page-level summary stats
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();
	const monthPad = String(currentMonth).padStart(2, '0');
	const monthPrefix = `${currentYear}-${monthPad}`;

	const jobsThisMonth = allJobs.filter((j) => j.jobDate.startsWith(monthPrefix));
	const earnedThisMonth = jobsThisMonth.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const jobsThisYear = allJobs.filter((j) => j.jobDate.startsWith(String(currentYear)));
	const earnedThisYear = jobsThisYear.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const jobsLastYear = allJobs.filter((j) => j.jobDate.startsWith(String(currentYear - 1)));
	const earnedLastYear = jobsLastYear.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const customerForm = await superValidate(zod4(windowCleaningCustomerSchema));
	const jobForm = await superValidate(zod4(windowCleaningJobSchema));

	return {
		customers: customersWithStats,
		totalCustomers: customers.length,
		jobsThisMonthCount: jobsThisMonth.length,
		earnedThisMonth,
		earnedThisYear,
		earnedLastYear,
		customerForm,
		jobForm
	};
};

export const actions = {
	createCustomer: createAction({
		schema: windowCleaningCustomerSchema,
		table: windowCleaningCustomer,
		entityName: 'Customer',
		transformCreate: (data, userId) => ({
			name: data.name,
			address: data.address,
			city: data.city,
			unitNumber: data.unitNumber || null,
			buzzerNumber: data.buzzerNumber || null,
			phoneNumber: data.phoneNumber || null,
			notes: data.notes || null,
			userId
		})
	}),

	updateCustomer: updateAction({
		schema: windowCleaningCustomerSchema,
		table: windowCleaningCustomer,
		entityName: 'Customer',
		transformUpdate: (data) => ({
			name: data.name,
			address: data.address,
			city: data.city,
			unitNumber: data.unitNumber || null,
			buzzerNumber: data.buzzerNumber || null,
			phoneNumber: data.phoneNumber || null,
			notes: data.notes || null
		})
	}),

	// Soft-delete: set deletedAt/deletedBy instead of hard delete
	deleteCustomer: requireAuth(async (event, user) => {
		const data = await event.request.formData();
		const id = data.get('id') as string | null;

		if (!id) {
			return fail(400, { error: 'Customer ID is required' });
		}

		try {
			await getDb()
				.update(windowCleaningCustomer)
				.set(
					withAuditFieldsForUpdate(
						{
							deletedAt: getCurrentUTCTimestamp(),
							deletedBy: user.id
						},
						user
					)
				)
				.where(eq(windowCleaningCustomer.id, id));

			logger.info(`Customer soft-deleted: ${id} by ${user.id}`);
			return { success: true, delete: true };
		} catch (error) {
			logger.error('Failed to delete customer', error);
			return fail(500, { error: 'Failed to delete customer' });
		}
	}),

	createJob: createAction({
		schema: windowCleaningJobSchema,
		table: windowCleaningJob,
		entityName: 'Job',
		transformCreate: (data, userId) => ({
			customerId: data.customerId,
			jobDate: formatDateForStorage(data.jobDate),
			jobTime: data.jobTime || null,
			amountCharged: data.amountCharged,
			tip: data.tip ?? 0,
			durationHours: data.durationHours ?? null,
			notes: data.notes || null,
			userId
		})
	}),

	updateJob: updateAction({
		schema: windowCleaningJobSchema,
		table: windowCleaningJob,
		entityName: 'Job',
		transformUpdate: (data) => ({
			customerId: data.customerId,
			jobDate: formatDateForStorage(data.jobDate),
			jobTime: data.jobTime || null,
			amountCharged: data.amountCharged,
			tip: data.tip ?? 0,
			durationHours: data.durationHours ?? null,
			notes: data.notes || null
		})
	}),

	deleteJob: requireAuth(async (event) => {
		const data = await event.request.formData();
		const id = data.get('id') as string | null;

		if (!id) {
			return fail(400, { error: 'Job ID is required' });
		}

		try {
			await getDb().delete(windowCleaningJob).where(eq(windowCleaningJob.id, id));
			logger.info(`Job deleted: ${id}`);
			return { success: true, delete: true };
		} catch (error) {
			logger.error('Failed to delete job', error);
			return fail(500, { error: 'Failed to delete job' });
		}
	})
};
