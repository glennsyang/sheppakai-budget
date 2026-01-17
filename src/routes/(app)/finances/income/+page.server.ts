import { fail } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { income } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { formatDateForStorage, getMonthDateRange } from '$lib/utils/dates';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { incomes: [] };
	}

	// Get month and year from URL or use current month/year
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1;
	const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear();

	// Get date range for the user's local month
	const { startDate, endDate } = getMonthDateRange(month, year);

	const incomes = await getDb().query.income.findMany({
		where: and(
			sql`date(${income.date}) >= date(${startDate})`,
			sql`date(${income.date}) <= date(${endDate})`
		),
		orderBy: [asc(income.date)]
	});

	return { incomes };
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasName = data.has('name');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasAmount = data.has('amount');

		if (!hasName || !hasDescription || !hasDate || !hasAmount) {
			return fail(400, { hasName, hasDescription, hasDate, hasAmount });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(income)
				.values(
					withAuditFieldsForCreate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || '',
							date: formatDateForStorage(data.get('date')?.toString() || ''),
							amount: Number(data.get('amount')),
							userId: userId
						},
						userId
					)
				);

			logger.info('Income created successfully');
		} catch (error) {
			logger.error('Failed to create income', error);
			return fail(500, { error: 'Failed to create income' });
		}

		return { success: true, create: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasName = data.has('name');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasAmount = data.has('amount');

		if (!hasId || !hasName || !hasDescription || !hasDate || !hasAmount) {
			return fail(400, { hasId, hasName, hasDescription, hasDate, hasAmount });
		}

		const incomeId = data.get('id')!.toString();

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(income)
				.set(
					withAuditFieldsForUpdate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || '',
							date: formatDateForStorage(data.get('date')?.toString() || ''),
							amount: Number(data.get('amount'))
						},
						userId
					)
				)
				.where(eq(income.id, incomeId));

			logger.info('Income updated successfully');
		} catch (error) {
			logger.error('Failed to update income', error);
			return fail(500, { error: 'Failed to update income' });
		}

		return { success: true, update: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const incomeId = data.get('id')!.toString();

		try {
			await getDb().delete(income).where(eq(income.id, incomeId));

			logger.info('Income deleted successfully');
		} catch (error) {
			logger.error('Failed to delete income', error);
			return fail(500, { error: 'Failed to delete income' });
		}

		return { success: true, delete: true };
	}
} satisfies Actions;
