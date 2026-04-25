import { transactionQueries } from '$lib/server/db/queries';
import { getReceiptLoadContext, receiptActions } from '$lib/server/receipts/load-helpers';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { categories } = await parent();
	const { gasCategory, month, year, startDate, endDate, yearStartDate, yearEndDate, form } =
		await getReceiptLoadContext(url, categories);

	const [monthlyTransactions, yearlyTransactions] = await Promise.all([
		transactionQueries.findByDateRangeExcludingCategory(startDate, endDate, gasCategory.id, true),
		transactionQueries.findByDateRangeExcludingCategory(
			yearStartDate,
			yearEndDate,
			gasCategory.id,
			true
		)
	]);

	return { monthlyTransactions, yearlyTransactions, month, year, form };
};

export const actions = receiptActions;
