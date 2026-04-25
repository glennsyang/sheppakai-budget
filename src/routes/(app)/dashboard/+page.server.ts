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

		const [actualExpenses, plannedExpenses, recurringExpenses, incomeRecords] = await Promise.all([
			transactionQueries.findByDateRange(startDate, endDate),
			budgetQueries.findByMonthYear(month, year),
			recurringQueries.findAll(),
			incomeQueries.findByDateRange(startDate, endDate)
		]);

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
		const historicalMonths: Array<{
			targetMonth: number;
			targetYear: number;
			monthStart: string;
			monthEnd: string;
		}> = [];
		let chartEnd = '';

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
			historicalMonths.push({ targetMonth, targetYear, monthStart, monthEnd });
			chartEnd = monthEnd;
		}

		if (historicalMonths.length > 0) {
			const chartStart = historicalMonths[0].monthStart;

			const [allChartTx, allChartIncome] = await Promise.all([
				transactionQueries.findByDateRange(chartStart, chartEnd),
				incomeQueries.findByDateRange(chartStart, chartEnd)
			]);

			const monthlyRecurringTotal = recurringExpenses.reduce((sum, item) => {
				if (item.cadence === 'Monthly') {
					return sum + item.amount;
				} else if (item.cadence === 'Yearly') {
					return sum + item.amount / 12;
				}
				return sum;
			}, 0);

			for (const { targetMonth, monthStart, monthEnd } of historicalMonths) {
				const monthTx = allChartTx.filter(
					(t) => t.date.substring(0, 10) >= monthStart && t.date.substring(0, 10) <= monthEnd
				);
				const monthInc = allChartIncome.filter(
					(inc) => inc.date.substring(0, 10) >= monthStart && inc.date.substring(0, 10) <= monthEnd
				);

				monthlyInOutData.push({
					month: monthNames[targetMonth - 1],
					in: monthInc.reduce((sum, inc) => sum + inc.amount, 0),
					out: monthTx.reduce((sum, t) => sum + t.amount, 0) + monthlyRecurringTotal
				});
			}
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

	const [actualExpenses, incomeRecords, recurringExpenses, allYearBudgets] = await Promise.all([
		transactionQueries.findByDateRange(startDate, endDate),
		incomeQueries.findByDateRange(startDate, endDate),
		recurringQueries.findAll(),
		budgetQueries.findByYear(year)
	]);

	const yearlyBudgets: Array<{
		categoryId: string;
		amount: number;
	}> = [];

	allYearBudgets.forEach((b) => {
		const existing = yearlyBudgets.find((e) => e.categoryId === b.category?.id);
		if (existing) {
			existing.amount += b.amount;
		} else if (b.category) {
			yearlyBudgets.push({
				categoryId: b.category.id,
				amount: b.amount
			});
		}
	});

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

	if (monthRanges.length > 0) {
		const chartStart = monthRanges[0].startDate;
		const chartEnd = monthRanges[monthRanges.length - 1].endDate;

		const [allChartTx, allChartIncome] = await Promise.all([
			transactionQueries.findByDateRange(chartStart, chartEnd),
			incomeQueries.findByDateRange(chartStart, chartEnd)
		]);

		const monthlyRecurringTotal = recurringExpenses.reduce((sum, item) => {
			if (item.cadence === 'Monthly') {
				return sum + item.amount;
			} else if (item.cadence === 'Yearly') {
				return sum + item.amount / 12;
			}
			return sum;
		}, 0);

		for (const range of monthRanges) {
			const monthTx = allChartTx.filter(
				(t) =>
					t.date.substring(0, 10) >= range.startDate && t.date.substring(0, 10) <= range.endDate
			);
			const monthInc = allChartIncome.filter(
				(inc) =>
					inc.date.substring(0, 10) >= range.startDate && inc.date.substring(0, 10) <= range.endDate
			);

			timeRangeData.push({
				month: monthNames[range.month - 1],
				in: monthInc.reduce((sum, inc) => sum + inc.amount, 0),
				out: monthTx.reduce((sum, t) => sum + t.amount, 0) + monthlyRecurringTotal
			});
		}
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
