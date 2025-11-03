import { db } from '$lib/server/db';
import { budget, transaction } from '$lib/server/db/schema';
import { and, desc, sql, eq, ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Budget, Transaction } from '$lib';
import { incomeCategoryId } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return [];
	}

	// Get month from URL or use current month
	const monthParam = url.searchParams.get('month');
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;

	// Get year from URL or use current year
	const yearParam = url.searchParams.get('year');
	const currentYear = currentDate.getFullYear();

	let year = currentYear;
	let month = currentMonth;
	if (monthParam && yearParam) {
		year = Number.parseInt(yearParam);
		month = Number.parseInt(monthParam);
	}

	const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	const actualExpenses: Transaction[] = (await db.query.transaction.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			sql`date(${transaction.date}) >= date(${startDate})`,
			sql`date(${transaction.date}) <= date(${endDate})`
		),
		orderBy: [desc(transaction.date)]
	})) as Transaction[];

	const plannedExpenses: Budget[] = (await db.query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			ne(budget.categoryId, incomeCategoryId),
			eq(budget.year, year.toString()),
			eq(budget.month, month.toString().padStart(2, '0'))
		)
	})) as Budget[];

	const plannedIncome: Budget[] = (await db.query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			eq(budget.categoryId, incomeCategoryId),
			eq(budget.year, year.toString()),
			eq(budget.month, month.toString().padStart(2, '0'))
		)
	})) as Budget[];

	// Calculate totals
	const actualExpensesTotal = actualExpenses.reduce((sum, expense) => sum + expense.amount, 0);
	const plannedExpensesTotal = plannedExpenses.reduce((sum, budget) => sum + budget.amount, 0);
	const plannedIncomeTotal = plannedIncome.reduce((sum, budget) => sum + budget.amount, 0);

	return {
		actualExpenses,
		plannedExpenses,
		actualExpensesTotal,
		plannedExpensesTotal,
		plannedIncome,
		plannedIncomeTotal
	};
};
