import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { incomeSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { incomeQueries } from '$lib/server/db/queries';
import { income } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthRangeFromUrl } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { incomes: [] };
	}

	// Get month, year, and date range from URL params or use current month/year
	const { startDate, endDate } = getMonthRangeFromUrl(url);

	const incomes = await incomeQueries.findByDateRange(startDate, endDate);

	const form = await superValidate(zod4(incomeSchema));

	return { incomes, form };
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
