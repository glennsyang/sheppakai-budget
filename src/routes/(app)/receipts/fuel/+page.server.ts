import { transactionSchema } from '$lib/formSchemas';
import { transactionQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { getReceiptLoadContext } from '$lib/server/receipts/load-helpers';
import { calculateMonthsSinceJanuary } from '$lib/utils/date-metrics';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const form = await superValidate(zod4(transactionSchema));

	try {
		const { categories } = await parent();
		const { gasCategory, year, startDate, endDate, yearStartDate, yearEndDate } =
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
	} catch (error) {
		logger.error('Failed to load fuel receipts:', error);
		return {
			monthlyTransactions: [],
			yearlyTransactions: [],
			completedMonthsSinceJanuary: 0,
			loadError: 'Failed to load fuel receipts. Please try refreshing the page.',
			form
		};
	}
};

export { receiptActions as actions } from '$lib/server/receipts/load-helpers';
