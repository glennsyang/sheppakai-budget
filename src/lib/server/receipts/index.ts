import type { Category } from '$lib';
import { transactionSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { transaction } from '$lib/server/db/schema';
import { toTransactionRow } from '$lib/server/db/writes/transactions';
import { transactionBudgetAlertHooks } from '$lib/server/notifications/budget-threshold-alerts';
import { getMonthRangeFromUrl, getYearDateRange } from '$lib/utils/dates';
import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

/** Fuel receipts are the transactions in this category; business receipts are everything else. */
const FUEL_CATEGORY_NAME = 'Gas';

/** Shared load context for the fuel and business receipt pages. */
export async function getReceiptLoadContext(url: URL, categories: Category[] | undefined) {
	const gasCategory = categories?.find((c) => c.name === FUEL_CATEGORY_NAME);
	if (!gasCategory) throw error(404, `${FUEL_CATEGORY_NAME} category not found`);

	const { year, startDate, endDate } = getMonthRangeFromUrl(url);
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);
	const form = await superValidate(zod4(transactionSchema));

	return { gasCategory, year, startDate, endDate, yearStartDate, yearEndDate, form };
}

/** CRUD actions shared by both receipt pages; receipts are ordinary transactions. */
export const receiptActions = createCrudActions({
	schema: transactionSchema,
	table: transaction,
	entityName: 'Transaction',
	...transactionBudgetAlertHooks,
	transformCreate: (data, userId) => ({ ...toTransactionRow(data), userId }),
	transformUpdate: (data) => toTransactionRow(data)
});
