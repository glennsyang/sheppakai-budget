import { transactionQueries } from '$lib/server/db/queries';
import { getReceiptLoadContext } from '$lib/server/receipts/load-helpers';
import { calculateMonthsSinceJanuary } from '$lib/utils/date-metrics';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { categories } = await parent();
	const { gasCategory, year, startDate, endDate, yearStartDate, yearEndDate, form } =
		await getReceiptLoadContext(url, categories);

	let completedMonthsSinceJanuary = calculateMonthsSinceJanuary(year);

	const [monthlyTransactions, yearlyTransactions] = await Promise.all([
		transactionQueries.findByCategory(gasCategory.id, { start: startDate, end: endDate }),
		transactionQueries.findByCategory(gasCategory.id, { start: yearStartDate, end: yearEndDate })
	]);

	return {
		monthlyTransactions,
		yearlyTransactions,
		completedMonthsSinceJanuary,
		form
	};
};

export { receiptActions as actions } from '$lib/server/receipts/load-helpers';
