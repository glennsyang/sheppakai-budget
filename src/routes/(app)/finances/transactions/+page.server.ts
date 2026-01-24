import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { budgetQueries, transactionQueries } from '$lib/server/db/queries';
import { transaction } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthRangeFromUrl } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { transactions: [] };
	}

	// Get month, year, and date range from URL params or use current month/year
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	const transactions = await transactionQueries.findByDateRange(startDate, endDate);

	// Load budgets for the current month/year
	const budgets = await budgetQueries.findByMonthYear(month, year);

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
		gstAmount: data.gstAmount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		categoryId: data.categoryId,
		userId
	}),
	transformUpdate: (data) => ({
		amount: data.amount,
		gstAmount: data.gstAmount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		categoryId: data.categoryId
	})
});
