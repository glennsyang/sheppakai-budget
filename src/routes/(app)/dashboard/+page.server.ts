import { auth } from '$lib/server/auth';
import {
	budgetQueries,
	incomeQueries,
	recurringQueries,
	transactionQueries
} from '$lib/server/db/queries';
import type { TimeRangeInOutData } from '$lib/types';
import { monthNames } from '$lib/utils';
import { getMonthDateRange, getMonthRangeFromUrl } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, locals, url }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});
	if (!locals.user && !session?.user) {
		return {};
	}

	// Get month, year, and date range from URL params or use current month/year
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	const actualExpenses = await transactionQueries.findByDateRange(startDate, endDate);

	const plannedExpenses = await budgetQueries.findByMonthYear(month, year);

	// Get recurring expenses for the user
	const recurringExpenses = await recurringQueries.findAll();

	// Get income for the selected month
	const incomeRecords = await incomeQueries.findByDateRange(startDate, endDate);

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

	// Generate monthly in/out data for the last 6 months
	const monthlyInOutData: TimeRangeInOutData[] = [];

	// Loop through current month and 5 previous months
	for (let i = 5; i >= 0; i--) {
		const targetDate = new Date(year, month - 1 - i, 1);
		const targetMonth = targetDate.getMonth() + 1;
		const targetYear = targetDate.getFullYear();

		// Only include months that have occurred (not future months)
		if (targetDate > new Date()) {
			continue;
		}

		const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange(targetMonth, targetYear);

		// Fetch data for this month
		const monthTransactions = await transactionQueries.findByDateRange(monthStart, monthEnd);
		const monthIncome = await incomeQueries.findByDateRange(monthStart, monthEnd);

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

		monthlyInOutData.push({
			month: monthNames[targetMonth - 1],
			in: totalIn,
			out: totalOut
		});
	}

	return {
		actualExpenses,
		plannedExpenses,
		actualExpensesTotal,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance,
		monthlyInOutData
	};
};
