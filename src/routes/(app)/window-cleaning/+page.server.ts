import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import {
	windowCleaningCustomerSchema,
	windowCleaningJobSchema
} from '$lib/formSchemas/windowCleaning';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { createAction, updateAction } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { windowCleaningCustomerQueries, windowCleaningJobQueries } from '$lib/server/db/queries';
import { windowCleaningCustomer, windowCleaningJob } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { getCurrentUTCTimestamp } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user!.id;

	const [customers, allJobs] = await Promise.all([
		windowCleaningCustomerQueries.findAll(userId),
		windowCleaningJobQueries.findAll(userId)
	]);

	// Merge job stats into each customer
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();
	const monthPad = String(currentMonth).padStart(2, '0');
	const monthPrefix = `${currentYear}-${monthPad}`;

	const customersWithStats = customers.map((customer) => {
		const jobs = allJobs.filter((j) => j.customerId === customer.id);
		const totalEarned = jobs.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);
		const lastJobDate = jobs.length > 0 ? jobs[0].jobDate : null;
		return { ...customer, jobs, totalEarned, lastJobDate };
	});

	// Page-level summary stats
	const jobsThisMonth = allJobs.filter((j) => j.jobDate.startsWith(monthPrefix));
	const earnedThisMonth = jobsThisMonth.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const jobsThisYear = allJobs.filter((j) => j.jobDate.startsWith(String(currentYear)));
	const earnedThisYear = jobsThisYear.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const customerForm = await superValidate(zod4(windowCleaningCustomerSchema));
	const jobForm = await superValidate(zod4(windowCleaningJobSchema));

	return {
		customers: customersWithStats,
		totalCustomers: customers.length,
		jobsThisMonthCount: jobsThisMonth.length,
		earnedThisMonth,
		earnedThisYear,
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
			jobDate: data.jobDate,
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
			jobDate: data.jobDate,
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
