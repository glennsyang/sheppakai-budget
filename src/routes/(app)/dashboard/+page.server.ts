import { and, desc, eq, sql } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { budget, income, transaction } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

import type { Budget, Income, Recurring, Transaction } from '$lib';

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

	const actualExpenses: Transaction[] = (await getDb().query.transaction.findMany({
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

	const plannedExpenses: Budget[] = (await getDb().query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			eq(budget.year, year.toString()),
			eq(budget.month, month.toString().padStart(2, '0'))
		)
	})) as Budget[];

	// Get recurring expenses for the user
	const recurringExpenses: Recurring[] = (await getDb().query.recurring.findMany({
		with: {
			user: true
		}
	})) as Recurring[];

	// Get income for the selected month
	const incomeRecords: Income[] = (await getDb().query.income.findMany({
		where: and(
			sql`date(${income.date}) >= date(${startDate})`,
			sql`date(${income.date}) <= date(${endDate})`
		)
	})) as Income[];

	// Calculate monthly recurring total (yearly expenses divided by 12)
	const recurringMonthlyTotal = recurringExpenses.reduce((sum, item) => {
		if (item.cadence === 'Monthly') {
			return sum + item.amount;
		} else if (item.cadence === 'Yearly') {
			return sum + item.amount / 12;
		}
		return sum;
	}, 0);

	// Calculate totals - include recurring in actual expenses
	const actualExpensesTotal =
		actualExpenses.reduce((sum, expense) => sum + expense.amount, 0) + recurringMonthlyTotal;
	const plannedExpensesTotal =
		plannedExpenses.reduce((sum, budget) => sum + budget.amount, 0) + recurringMonthlyTotal;

	// Calculate income totals
	const totalIncome = incomeRecords.reduce((sum, inc) => sum + inc.amount, 0);
	const remainingBalance = totalIncome - plannedExpensesTotal;

	return {
		actualExpenses,
		plannedExpenses,
		actualExpensesTotal,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance
	};
};
