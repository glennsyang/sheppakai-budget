import { incomeSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { incomeQueries } from '$lib/server/db/queries';
import { income } from '$lib/server/db/schema';
import { toIncomeRow } from '$lib/server/db/writes/income';
import { logger } from '$lib/server/logger';
import { calculateMonthsSinceJanuary } from '$lib/utils/date-metrics';
import { getMonthRangeFromUrl, getYearDateRange } from '$lib/utils/dates';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get month, year, and date range from URL params or use current month/year
	const { year, startDate, endDate } = getMonthRangeFromUrl(url);

	// Get yearly date range
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);

	let completedMonthsSinceJanuary = calculateMonthsSinceJanuary(year);

	const form = await superValidate(zod4(incomeSchema));

	try {
		// Load monthly incomes for user
		const monthlyIncomes = await incomeQueries.findByDateRange(startDate, endDate);

		// Load yearly incomes for user
		const yearlyIncomes = await incomeQueries.findByDateRange(yearStartDate, yearEndDate);

		return {
			monthlyIncomes,
			yearlyIncomes,
			completedMonthsSinceJanuary,
			form
		};
	} catch (error) {
		logger.error('Failed to load income data:', error);
		return {
			monthlyIncomes: [],
			yearlyIncomes: [],
			completedMonthsSinceJanuary,
			loadError: 'Failed to load income data. Please try refreshing the page.',
			form
		};
	}
};

export const actions = createCrudActions({
	schema: incomeSchema,
	table: income,
	entityName: 'Income',
	transformCreate: (data, userId) => ({ ...toIncomeRow(data), userId }),
	transformUpdate: (data) => toIncomeRow(data)
}) satisfies Actions;
