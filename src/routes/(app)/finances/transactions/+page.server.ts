import { db } from '$lib/server/db';
import { expense } from '$lib/server/db/schema';
import { and, desc, sql } from 'drizzle-orm';
import type { Expense } from '$lib';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { expenses: [] };
	}

	// Get month and year from URL or use current month/year
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1;
	const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear();

	const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	const expenses: Expense[] = (await db.query.expense.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			sql`date(${expense.date}) >= date(${startDate})`,
			sql`date(${expense.date}) <= date(${endDate})`
		),
		orderBy: [desc(expense.date)]
	})) as Expense[];

	return {
		expenses
	};
};
