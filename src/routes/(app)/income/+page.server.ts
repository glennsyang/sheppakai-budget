import { incomeSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { incomeQueries } from '$lib/server/db/queries';
import { income } from '$lib/server/db/schema';
import { toIncomeRow } from '$lib/server/db/writes/income';
import { logger } from '$lib/server/logger';
import {
	calculateMonthsSinceJanuary,
	filterByDateRange,
	getMonthRangeFromUrl,
	getYearDateRange
} from '$lib/utils/dates';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Get month, year, and date range from URL params or use current month/year
	const { year, startDate, endDate } = getMonthRangeFromUrl(url);

	// Get yearly date range
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);

	const completedMonthsSinceJanuary = calculateMonthsSinceJanuary(year);

	const form = await superValidate(zod4(incomeSchema));

	try {
		// The month is a subset of the year, so load the year once and derive the month from it.
		const yearlyIncomes = await incomeQueries.findByDateRange(yearStartDate, yearEndDate);
		const monthlyIncomes = filterByDateRange(yearlyIncomes, startDate, endDate);

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
