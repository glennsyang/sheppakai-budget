import { db } from '$lib/server/db';
import { expense, income } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Expense, Income } from '$lib';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	if (!locals.user) {
		return [];
	}

	console.log('url', url.searchParams as URLSearchParams);
	console.log('params', params);

	const allIncome: Income[] = await db.query.income.findMany({
		with: {
			category: true,
			user: true
		},
		// where: and(
		// 	sql`date(${income.date}) >= date(${startDate})`,
		// 	sql`date(${income.date}) <= date(${endDate})`,
		// 	eq(income.userId, locals.user.id)
		// ),
		orderBy: [desc(income.date)]
	});

	const allExpenses: Expense[] = await db.query.expense.findMany({
		with: {
			category: true,
			user: true
		},
		// where: and(
		// 	sql`date(${expense.date}) >= date(${startDate})`,
		// 	sql`date(${expense.date}) <= date(${endDate})`,
		// 	eq(expense.userId, locals.user.id)
		// ),
		orderBy: [desc(expense.date)]
	});

	// Calculate totals
	const totalExpenses = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
	const totalIncome = allIncome.reduce((sum, inc) => sum + inc.amount, 0);

	return {
		expenses: allExpenses.slice(0, 5),
		income: allIncome.slice(0, 5),
		totalExpenses,
		totalIncome
	};
};
