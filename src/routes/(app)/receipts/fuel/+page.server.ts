import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { transactionQueries } from '$lib/server/db/queries';
import { transaction } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthRangeFromUrl, getYearDateRange } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, parent }) => {
	if (!locals.user) {
		return { monthlyTransactions: [], yearlyTransactions: [], month: 1, year: 2026 };
	}

	// Get categories from parent layout
	const { categories } = await parent();

	// Find Gas category
	const gasCategory = categories?.find((c) => c.name === 'Gas');
	if (!gasCategory) {
		throw error(404, 'Gas category not found');
	}

	// Get month, year, and date range from URL params
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	// Get yearly date range
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const completedMonthsSinceJanuary =
		year < currentYear ? 12 : year > currentYear ? 0 : currentDate.getMonth();

	// Load monthly transactions for Gas category
	const monthlyTransactions = await transactionQueries.findByCategory(gasCategory.id, {
		start: startDate,
		end: endDate
	});

	// Load yearly transactions for Gas category
	const yearlyTransactions = await transactionQueries.findByCategory(gasCategory.id, {
		start: yearStartDate,
		end: yearEndDate
	});

	const form = await superValidate(zod4(transactionSchema));

	return {
		monthlyTransactions,
		yearlyTransactions,
		completedMonthsSinceJanuary,
		month,
		year,
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
		gstAmount: data.gstAmount ?? null,
		categoryId: data.categoryId,
		userId
	}),
	transformUpdate: (data) => ({
		amount: data.amount,
		payee: data.payee,
		notes: data.notes,
		date: formatDateForStorage(data.date),
		gstAmount: data.gstAmount ?? null,
		categoryId: data.categoryId
	})
});
