import { transactionSchema } from '$lib/formSchemas';
import { transactionQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { getReceiptLoadContext } from '$lib/server/receipts/load-helpers';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, parent }) => {
	const form = await superValidate(zod4(transactionSchema));

	try {
		const { categories } = await parent();
		const { gasCategory, startDate, endDate, yearStartDate, yearEndDate } =
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

export { receiptActions as actions } from '$lib/server/receipts/load-helpers';
