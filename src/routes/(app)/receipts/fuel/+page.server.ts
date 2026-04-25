import { transactionQueries } from '$lib/server/db/queries';
import { getReceiptLoadContext, receiptActions } from '$lib/server/receipts/load-helpers';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { categories } = await parent();
	const { gasCategory, month, year, startDate, endDate, yearStartDate, yearEndDate, form } =
		await getReceiptLoadContext(url, categories);

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const completedMonthsSinceJanuary =
		year < currentYear ? 12 : year > currentYear ? 0 : currentDate.getMonth();

	const [monthlyTransactions, yearlyTransactions] = await Promise.all([
		transactionQueries.findByCategory(gasCategory.id, { start: startDate, end: endDate }),
		transactionQueries.findByCategory(gasCategory.id, { start: yearStartDate, end: yearEndDate })
	]);

	return {
		monthlyTransactions,
		yearlyTransactions,
		completedMonthsSinceJanuary,
		month,
		year,
		form
	};
};

export const actions = receiptActions;
