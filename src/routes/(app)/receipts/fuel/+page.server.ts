import { transactionQueries } from '$lib/server/db/queries';
import { getReceiptLoadContext } from '$lib/server/receipts/load-helpers';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { categories } = await parent();
	const { gasCategory, month, year, startDate, endDate, yearStartDate, yearEndDate, form } =
		await getReceiptLoadContext(url, categories);

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();

	let completedMonthsSinceJanuary: number;
	if (year < currentYear) completedMonthsSinceJanuary = 12;
	else if (year > currentYear) completedMonthsSinceJanuary = 0;
	else completedMonthsSinceJanuary = currentDate.getMonth();

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

export { receiptActions as actions } from '$lib/server/receipts/load-helpers';
