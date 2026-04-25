import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Category } from '$lib';
import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { transaction } from '$lib/server/db/schema';
import { transactionBudgetAlertHooks } from '$lib/server/notifications/budget-threshold-alerts';
import { formatDateForStorage, getMonthRangeFromUrl, getYearDateRange } from '$lib/utils/dates';

export async function getReceiptLoadContext(url: URL, categories: Category[] | undefined) {
	const gasCategory = categories?.find((c) => c.name === 'Gas');
	if (!gasCategory) throw error(404, 'Gas category not found');

	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);
	const form = await superValidate(zod4(transactionSchema));

	return { gasCategory, month, year, startDate, endDate, yearStartDate, yearEndDate, form };
}

export const receiptActions = createCrudActions({
	schema: transactionSchema,
	table: transaction,
	entityName: 'Transaction',
	...transactionBudgetAlertHooks,
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
