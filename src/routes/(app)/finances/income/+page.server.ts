import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { incomeSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { incomeQueries } from '$lib/server/db/queries';
import { income } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthRangeFromUrl, getYearDateRange } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { monthlyIncomes: [], yearlyIncomes: [], month: 1, year: 2026 };
	}

	// Get month, year, and date range from URL params or use current month/year
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	// Get yearly date range
	const { startDate: yearStartDate, endDate: yearEndDate } = getYearDateRange(year);

	const currentDate = new Date();
	const currentYear = currentDate.getFullYear();
	const completedMonthsSinceJanuary =
		year < currentYear ? 12 : year > currentYear ? 0 : currentDate.getMonth();

	// Load monthly incomes for user
	const monthlyIncomes = await incomeQueries.findByDateRange(startDate, endDate);

	// Load yearly incomes for user
	const yearlyIncomes = await incomeQueries.findByDateRange(yearStartDate, yearEndDate);

	const form = await superValidate(zod4(incomeSchema));

	return {
		monthlyIncomes,
		yearlyIncomes,
		completedMonthsSinceJanuary,
		month,
		year,
		form
	};
};

export const actions = createCrudActions({
	schema: incomeSchema,
	table: income,
	entityName: 'Income',
	transformCreate: (data, userId) => ({
		name: data.name,
		description: data.description,
		date: formatDateForStorage(data.date),
		amount: data.amount,
		userId
	}),
	transformUpdate: (data) => ({
		name: data.name,
		description: data.description,
		date: formatDateForStorage(data.date),
		amount: data.amount
	})
});
