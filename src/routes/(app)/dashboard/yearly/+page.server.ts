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

	// Get view mode and year from URL params
	const view = url.searchParams.get('view') ?? 'current'; // 'current' or 'full'
	const currentYear = new Date().getFullYear();
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? Number.parseInt(yearParam) : currentYear;

	// Get date range for the full year
	const { startDate, endDate } = getYearDateRange(year);

	// Fetch all data for the year
	const actualExpenses = await transactionQueries.findByDateRange(startDate, endDate);
	const incomeRecords = await incomeQueries.findByDateRange(startDate, endDate);
	const recurringExpenses = await recurringQueries.findAll();

	// Get all budgets for the year (need to aggregate across all months)
	const yearlyBudgets: Array<{
		categoryId: string;
		amount: number;
	}> = [];

	// Aggregate budgets across all months of the year
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

	// Calculate yearly recurring total
	const recurringYearlyTotal = recurringExpenses.reduce((sum, item) => {
		if (item.cadence === 'Monthly') {
			return sum + item.amount * 12;
		} else if (item.cadence === 'Yearly') {
			return sum + item.amount;
		}
		return sum;
	}, 0);

	// Calculate totals
	const actualExpensesTotal =
		actualExpenses.reduce((sum, expense) => sum + expense.amount, 0) + recurringYearlyTotal;
	const plannedExpensesTotal =
		yearlyBudgets.reduce((sum, budget) => sum + budget.amount, 0) + recurringYearlyTotal;
	const totalIncome = incomeRecords.reduce((sum, inc) => sum + inc.amount, 0);
	const remainingBalance = totalIncome - plannedExpensesTotal;

	// Generate time range data based on view mode
	const timeRangeData: TimeRangeInOutData[] = [];
	let monthRanges;

	if (view === 'current' && year === currentYear) {
		// Last 6 months from current month
		monthRanges = getPreviousMonthsRange(6);
	} else {
		// Full calendar year (or up to current month for current year)
		monthRanges = getCalendarYearMonthsRange(year);
	}

	// Fetch data for each month in the range
	for (const range of monthRanges) {
		const monthTransactions = await transactionQueries.findByDateRange(
			range.startDate,
			range.endDate
		);
		const monthIncome = await incomeQueries.findByDateRange(range.startDate, range.endDate);

		// Calculate monthly recurring expenses
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
		actualExpenses,
		yearlyBudgets,
		actualExpensesTotal,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance,
		timeRangeData,
		view,
		year
	};
};
