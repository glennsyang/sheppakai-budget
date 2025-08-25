import { db } from '$lib/server/db';
import { budget, expense, income } from '$lib/server/db/schema';
import { and, desc, sql, eq, ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Budget, Expense, Income } from '$lib';

const incomeCategoryId = '4a2f9787-df72-4af0-94ce-193c87494956';

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
		year = parseInt(yearParam);
		month = parseInt(monthParam);
	}

	const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	const actualIncome: Income[] = (await db.query.income.findMany({
		with: {
			user: true
		},
		where: and(
			sql`date(${income.date}) >= date(${startDate})`,
			sql`date(${income.date}) <= date(${endDate})`
		),
		orderBy: [desc(income.date)]
	})) as Income[];

	const actualExpenses: Expense[] = (await db.query.expense.findMany({
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
	const actualIncomeTotal = actualIncome.reduce((sum, inc) => sum + inc.amount, 0);
	const plannedIncomeTotal = plannedIncome.reduce((sum, budget) => sum + budget.amount, 0);

	return {
		actualExpenses,
		plannedExpenses,
		actualExpensesTotal,
		plannedExpensesTotal,
		actualIncome,
		plannedIncome,
		actualIncomeTotal,
		plannedIncomeTotal
	};
};
