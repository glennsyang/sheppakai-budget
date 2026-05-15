import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { budgetQueries, transactionQueries } from '$lib/server/db/queries';
import { transaction } from '$lib/server/db/schema';
import { transactionBudgetAlertHooks } from '$lib/server/notifications/budget-threshold-alerts';
import { formatDateForStorage, getMonthRangeFromUrl } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get month, year, and date range from URL params or use current month/year
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	const searchQuery = url.searchParams.get('search') ?? '';
	const form = await superValidate(zod4(transactionSchema));

	// In search mode: query across all months, skip budget data (sidebar is hidden)
	if (searchQuery) {
		const transactions = await transactionQueries.search(searchQuery);
		return {
			transactions,
			budgets: [],
			categorySpending: {},
			form,
			searchQuery
		};
	}

	const transactions = await transactionQueries.findByDateRange(startDate, endDate);

	// Load budgets for the current month/year
	const budgets = await budgetQueries.findByMonthYear(month, year);

	// Calculate spending per category
	const categorySpending = transactions.reduce<Record<string, number>>((acc, txn) => {
		if (txn.category) {
			const categoryId = txn.category.id;
			acc[categoryId] = (acc[categoryId] || 0) + txn.amount;
		}
		return acc;
	}, {});

	return {
		transactions,
		budgets,
		categorySpending,
		form,
		searchQuery
	};
};

export const actions = createCrudActions({
	schema: transactionSchema,
	table: transaction,
	entityName: 'Transaction',
	...transactionBudgetAlertHooks,
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
