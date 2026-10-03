import { transactionQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { getReceiptLoadContext } from '$lib/server/receipts';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const { categories } = await parent();
	const { gasCategory, startDate, endDate, yearStartDate, yearEndDate, form } =
		await getReceiptLoadContext(url, categories);

	try {
		const [monthlyTransactions, yearlyTransactions] = await Promise.all([
			transactionQueries.findByDateRangeExcludingCategory(startDate, endDate, gasCategory.id, true),
			transactionQueries.findByDateRangeExcludingCategory(
				yearStartDate,
				yearEndDate,
				gasCategory.id,
				true
			)
		]);

		return { monthlyTransactions, yearlyTransactions, form };
	} catch (error) {
		logger.error('Failed to load business receipts:', error);
		return {
			monthlyTransactions: [],
			yearlyTransactions: [],
			loadError: 'Failed to load business receipts. Please try refreshing the page.',
			form
		};
	}
};

export { receiptActions as actions } from '$lib/server/receipts';
