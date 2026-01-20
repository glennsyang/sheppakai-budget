import { auth } from '$lib/server/auth';
import {
	budgetQueries,
	incomeQueries,
	recurringQueries,
	transactionQueries
} from '$lib/server/db/queries';
import { getMonthRangeFromUrl } from '$lib/utils/dates';

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

	return {
		actualExpenses,
		plannedExpenses,
		actualExpensesTotal,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance
	};
};
