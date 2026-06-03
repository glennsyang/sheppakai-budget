import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { budgetQueries, transactionQueries } from '$lib/server/db/queries';
import { SEARCH_RESULT_LIMIT } from '$lib/server/db/queries/transactions';
import { transaction } from '$lib/server/db/schema';
import { transactionBudgetAlertHooks } from '$lib/server/notifications/budget-threshold-alerts';
import { formatDateForStorage, getMonthRangeFromUrl } from '$lib/utils/dates';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get month, year, and date range from URL params or use current month/year
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	// Normalize on the server regardless of what the client sends: trim whitespace and cap at
	// the notes column max length (800 chars) so a crafted URL can't trigger an oversized query.
	const searchQuery = (url.searchParams.get('search') ?? '').trim().slice(0, 800);
	const form = await superValidate(zod4(transactionSchema));

	// In search mode: query across all months, skip budget data (sidebar is hidden)
	if (searchQuery) {
		const transactions = await transactionQueries.search(searchQuery);
		return {
			transactions,
			budgets: [],
			categorySpending: {},
			excludedFromBudgetTotal: 0,
			form,
			searchQuery,
			searchLimitReached: transactions.length >= SEARCH_RESULT_LIMIT
		};
	}

	const transactions = await transactionQueries.findByDateRange(startDate, endDate);
	const budgetTransactions = transactions.filter((txn) => !txn.excludedFromBudget);
	const excludedFromBudgetTotal = transactions.reduce(
		(sum, txn) => sum + (txn.excludedFromBudget ? txn.amount : 0),
		0
	);

	// Load budgets for the current month/year
	const budgets = await budgetQueries.findByMonthYear(month, year);

	// Calculate spending per category
	const categorySpending = budgetTransactions.reduce<Record<string, number>>((acc, txn) => {
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
		excludedFromBudgetTotal,
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
		excludedFromBudget: data.excludedFromBudget,
		categoryId: data.categoryId,
		userId
	}),
	transformUpdate: (data) => ({
		amount: data.amount,
		gstAmount: data.gstAmount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		excludedFromBudget: data.excludedFromBudget,
		categoryId: data.categoryId
	})
});
