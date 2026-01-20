import { fail } from '@sveltejs/kit';
import { and, desc, eq, sql } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { transactionSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { budget, transaction } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { formatDateForStorage, getMonthDateRange } from '$lib/utils/dates';

import type { Actions, PageServerLoad } from './$types';

import type { Budget, Transaction } from '$lib';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { transactions: [] };
	}

	// Get month and year from URL or use current month/year
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1;
	const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear();

	// Get date range for the user's local month
	const { startDate, endDate } = getMonthDateRange(month, year);

	const transactions: Transaction[] = (await getDb().query.transaction.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			sql`date(${transaction.date}) >= date(${startDate})`,
			sql`date(${transaction.date}) <= date(${endDate})`
		),
		orderBy: [desc(transaction.date)]
	})) as Transaction[];

	// Load budgets for the current month/year
	const budgets: Budget[] = (await getDb().query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			eq(budget.month, month.toString().padStart(2, '0')),
			eq(budget.year, year.toString())
		)
	})) as Budget[];

	// Calculate spending per category
	const categorySpending = transactions.reduce(
		(acc, txn) => {
			if (txn.category) {
				const categoryId = txn.category.id;
				acc[categoryId] = (acc[categoryId] || 0) + txn.amount;
			}
			return acc;
		},
		{} as Record<string, number>
	);

	const form = await superValidate(zod4(transactionSchema));

	return {
		transactions,
		budgets,
		categorySpending,
		form
	};
};

export const actions = {
	create: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(transactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(transaction)
				.values(
					withAuditFieldsForCreate(
						{
							amount: form.data.amount,
							payee: form.data.payee,
							notes: form.data.notes,
							date: formatDateForStorage(form.data.date),
							categoryId: form.data.categoryId,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('transaction created successfully');
		} catch (error) {
			logger.error('Failed to create transaction', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create transaction. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	}),

	update: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(transactionSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const transactionId = form.data.id!;
		try {
			await getDb()
				.update(transaction)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: form.data.amount,
							payee: form.data.payee,
							notes: form.data.notes,
							date: formatDateForStorage(form.data.date),
							categoryId: form.data.categoryId
						},
						user
					)
				)
				.where(eq(transaction.id, transactionId));

			logger.info('Transaction updated successfully');
		} catch (error) {
			logger.error('Failed to update transaction', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update transaction. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, update: true, form };
	}),

	delete: requireAuth(async ({ request }, user) => {
		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const transactionId = data.get('id')!.toString();

		try {
			await getDb().delete(transaction).where(eq(transaction.id, transactionId));

			logger.info('Transaction deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete transaction', error);
			return fail(500, { error: 'Failed to delete transaction entry' });
		}

		return { success: true, update: true };
	})
} satisfies Actions;
