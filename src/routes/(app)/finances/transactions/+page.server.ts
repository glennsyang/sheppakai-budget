import { and, desc, eq, sql } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { budget, transaction } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthDateRange } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

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

export const actions = createCrudActions({
	schema: transactionSchema,
	table: transaction,
	entityName: 'Transaction',
	transformCreate: (data, userId) => ({
		amount: data.amount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		categoryId: data.categoryId,
		userId
	}),
	transformUpdate: (data) => ({
		amount: data.amount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		categoryId: data.categoryId
	})
});
