import { and, asc, sql } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { incomeSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { income } from '$lib/server/db/schema';
import { formatDateForStorage, getMonthDateRange } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { incomes: [] };
	}

	// Get month and year from URL or use current month/year
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1;
	const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear();

	// Get date range for the user's local month
	const { startDate, endDate } = getMonthDateRange(month, year);

	const incomes = await getDb().query.income.findMany({
		where: and(
			sql`date(${income.date}) >= date(${startDate})`,
			sql`date(${income.date}) <= date(${endDate})`
		),
		orderBy: [asc(income.date)]
	});

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
