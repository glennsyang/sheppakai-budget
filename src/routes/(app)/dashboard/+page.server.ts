import { auth } from '$lib/server/auth';
import {
	budgetQueries,
	incomeQueries,
	recurringQueries,
	transactionQueries
} from '$lib/server/db/queries';
import type { TimeRangeInOutData } from '$lib/types';
import { monthNames } from '$lib/utils';
import {
	getCalendarYearMonthsRange,
	getMonthDateRange,
	getMonthRangeFromUrl,
	getPreviousMonthsRange,
	getYearDateRange
} from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, locals, url }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	if (!locals.user && !session?.user) {
		return {};
	}

	const mode = url.searchParams.get('mode') === 'yearly' ? 'yearly' : 'monthly';
	const currentYear = new Date().getFullYear();

	if (mode === 'monthly') {
		const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

		const actualExpenses = await transactionQueries.findByDateRange(startDate, endDate);
		const plannedExpenses = await budgetQueries.findByMonthYear(month, year);
		const recurringExpenses = await recurringQueries.findAll();
		const incomeRecords = await incomeQueries.findByDateRange(startDate, endDate);

		const recurringMonthlyTotal = recurringExpenses.reduce((sum, item) => {
			if (item.cadence === 'Monthly') {
				return sum + item.amount;
			} else if (item.cadence === 'Yearly') {
				return sum + item.amount / 12;
			}
			return sum;
		}, 0);

		const actualExpensesTotal =
			actualExpenses.reduce((sum, expense) => sum + expense.amount, 0) + recurringMonthlyTotal;
		const plannedExpensesTotal =
			plannedExpenses.reduce((sum, budget) => sum + budget.amount, 0) + recurringMonthlyTotal;
		const totalIncome = incomeRecords.reduce((sum, inc) => sum + inc.amount, 0);
		const remainingBalance = totalIncome - plannedExpensesTotal;

		const monthlyInOutData: TimeRangeInOutData[] = [];
		for (let i = 5; i >= 0; i--) {
			const targetDate = new Date(year, month - 1 - i, 1);
			const targetMonth = targetDate.getMonth() + 1;
			const targetYear = targetDate.getFullYear();

			if (targetDate > new Date()) {
				continue;
			}

			const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange(
				targetMonth,
				targetYear
			);

			const monthTransactions = await transactionQueries.findByDateRange(monthStart, monthEnd);
			const monthIncome = await incomeQueries.findByDateRange(monthStart, monthEnd);

			const monthlyRecurringTotal = recurringExpenses.reduce((sum, item) => {
				if (item.cadence === 'Monthly') {
					return sum + item.amount;
				} else if (item.cadence === 'Yearly') {
					return sum + item.amount / 12;
				}
				return sum;
			}, 0);

			const totalOut =
				monthTransactions.reduce((sum, t) => sum + t.amount, 0) + monthlyRecurringTotal;
			const totalIn = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);

			monthlyInOutData.push({
				month: monthNames[targetMonth - 1],
				in: totalIn,
				out: totalOut
			});
		}

		return {
			mode,
			month,
			year,
			actualExpenses,
			plannedExpenses,
			actualExpensesTotal,
			plannedExpensesTotal,
			totalIncome,
			remainingBalance,
			monthlyInOutData
		};
	}

	const view = url.searchParams.get('view') === 'full' ? 'full' : 'current';
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? Number.parseInt(yearParam) : currentYear;
	const { startDate, endDate } = getYearDateRange(year);

	const actualExpenses = await transactionQueries.findByDateRange(startDate, endDate);
	const incomeRecords = await incomeQueries.findByDateRange(startDate, endDate);
	const recurringExpenses = await recurringQueries.findAll();

	const yearlyBudgets: Array<{
		categoryId: string;
		amount: number;
	}> = [];

	for (let month = 1; month <= 12; month++) {
		const monthBudgets = await budgetQueries.findByMonthYear(month, year);
		monthBudgets.forEach((budget) => {
			const existingCategoryBudget = yearlyBudgets.find(
				(b) => b.categoryId === budget.category?.id
			);
			if (existingCategoryBudget) {
				existingCategoryBudget.amount += budget.amount;
			} else if (budget.category) {
				yearlyBudgets.push({
					categoryId: budget.category.id,
					amount: budget.amount
				});
			}
		});
	}

	const recurringYearlyTotal = recurringExpenses.reduce((sum, item) => {
		if (item.cadence === 'Monthly') {
			return sum + item.amount * 12;
		} else if (item.cadence === 'Yearly') {
			return sum + item.amount;
		}
		return sum;
	}, 0);

	const actualExpensesTotal =
		actualExpenses.reduce((sum, expense) => sum + expense.amount, 0) + recurringYearlyTotal;
	const plannedExpensesTotal =
		yearlyBudgets.reduce((sum, budget) => sum + budget.amount, 0) + recurringYearlyTotal;
	const totalIncome = incomeRecords.reduce((sum, inc) => sum + inc.amount, 0);
	const remainingBalance = totalIncome - plannedExpensesTotal;

	const timeRangeData: TimeRangeInOutData[] = [];
	const monthRanges =
		view === 'current' && year === currentYear
			? getPreviousMonthsRange(6)
			: getCalendarYearMonthsRange(year);

	for (const range of monthRanges) {
		const monthTransactions = await transactionQueries.findByDateRange(
			range.startDate,
			range.endDate
		);
		const monthIncome = await incomeQueries.findByDateRange(range.startDate, range.endDate);

		const monthlyRecurringTotal = recurringExpenses.reduce((sum, item) => {
			if (item.cadence === 'Monthly') {
				return sum + item.amount;
			} else if (item.cadence === 'Yearly') {
				return sum + item.amount / 12;
			}
			return sum;
		}, 0);

		const totalOut =
			monthTransactions.reduce((sum, t) => sum + t.amount, 0) + monthlyRecurringTotal;
		const totalIn = monthIncome.reduce((sum, inc) => sum + inc.amount, 0);

		timeRangeData.push({
			month: monthNames[range.month - 1],
			in: totalIn,
			out: totalOut
		});
	}

	return {
		mode,
		view,
		year,
		actualExpenses,
		yearlyBudgets,
		actualExpensesTotal,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance,
		timeRangeData
	};
};
