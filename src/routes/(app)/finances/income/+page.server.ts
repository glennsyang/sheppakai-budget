import { fail } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { incomeSchema } from '$lib/formSchemas';
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

	const form = await superValidate(zod4(incomeSchema));

	return { incomes, form };
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(incomeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(income)
				.values(
					withAuditFieldsForCreate(
						{
							name: form.data.name,
							description: form.data.description,
							date: formatDateForStorage(form.data.date),
							amount: form.data.amount,
							userId: userId
						},
						userId
					)
				);

			logger.info('Income created successfully');
		} catch (error) {
			logger.error('Failed to create income', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create income. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(incomeSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const incomeId = form.data.id!;

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(income)
				.set(
					withAuditFieldsForUpdate(
						{
							name: form.data.name,
							description: form.data.description,
							date: formatDateForStorage(form.data.date),
							amount: form.data.amount
						},
						userId
					)
				)
				.where(eq(income.id, incomeId));

			logger.info('Income updated successfully');
		} catch (error) {
			logger.error('Failed to update income', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update income. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, update: true, form };
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
