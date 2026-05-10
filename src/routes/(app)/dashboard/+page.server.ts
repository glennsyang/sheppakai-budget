import { inArray, sum } from 'drizzle-orm';

import {
	budgetQueries,
	incomeQueries,
	recurringQueries,
	savingsGoalQueries,
	transactionQueries,
	windowCleaningJobQueries
} from '$lib/server/db/queries';
import { getDb } from '$lib/server/db';
import { contribution } from '$lib/server/db/schema';
import type { SavingsGoalWithProgress, TimeRangeInOutData } from '$lib/types';
import { monthNames } from '$lib/utils';
import {
	getCalendarYearMonthsRange,
	getMonthDateRange,
	getMonthRangeFromUrl,
	getPreviousMonthsRange,
	getYearDateRange
} from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

async function getGoalsWithProgress(): Promise<SavingsGoalWithProgress[]> {
	const goals = await savingsGoalQueries.findAll();
	const activeGoals = goals.filter((g) => g.status === 'active');

	if (activeGoals.length === 0) return [];

	const activeGoalIds = activeGoals.map((g) => g.id);

	const totalsRows = await getDb()
		.select({ goalId: contribution.goalId, total: sum(contribution.amount) })
		.from(contribution)
		.where(inArray(contribution.goalId, activeGoalIds))
		.groupBy(contribution.goalId);

	const totalsMap = new Map(totalsRows.map((r) => [r.goalId, Number(r.total ?? 0)]));

	return activeGoals.map((goal) => {
		const total = totalsMap.get(goal.id) ?? 0;
		const percentage = goal.targetAmount > 0 ? (total / goal.targetAmount) * 100 : 0;
		return { ...goal, currentAmount: total, percentage: Math.min(percentage, 100) };
	});
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const userId = locals.user?.id;
	const mode = url.searchParams.get('mode') === 'yearly' ? 'yearly' : 'monthly';
	const currentYear = new Date().getFullYear();

	if (mode === 'monthly') {
		const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

		const [actualExpenses, plannedExpenses, recurringExpenses, incomeRecords, goalsWithProgress] =
			await Promise.all([
				transactionQueries.findByDateRange(startDate, endDate),
				budgetQueries.findByMonthYear(month, year),
				recurringQueries.findAll(),
				incomeQueries.findByDateRange(startDate, endDate),
				getGoalsWithProgress()
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

		// Sparkline arrays derived from historical chart data
		const netflowSparkline = monthlyInOutData.map((d) => ({ month: d.month, value: d.in - d.out }));
		const spendingSparkline = monthlyInOutData.map((d) => ({ month: d.month, value: d.out }));

		// Window cleaning revenue for the month
		let windowCleaningRevenue = 0;
		let windowCleaningJobCount = 0;
		if (userId) {
			const wcJobs = await windowCleaningJobQueries.findByMonth(userId, month, year);
			windowCleaningRevenue = wcJobs.reduce((s, j) => s + j.amountCharged + j.tip, 0);
			windowCleaningJobCount = wcJobs.length;
		}

		return {
			mode,
			month,
			year,
			actualExpenses,
			plannedExpenses,
			recurringExpenses,
			actualExpensesTotal,
			plannedExpensesTotal,
			totalIncome,
			remainingBalance,
			monthlyInOutData,
			netflowSparkline,
			spendingSparkline,
			goalsWithProgress,
			windowCleaningRevenue,
			windowCleaningJobCount
		};
	}

	const view = url.searchParams.get('view') === 'full' ? 'full' : 'current';
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? Number.parseInt(yearParam) : currentYear;
	const { startDate, endDate } = getYearDateRange(year);

	const [actualExpenses, incomeRecords, recurringExpenses, allYearBudgets, goalsWithProgress] =
		await Promise.all([
			transactionQueries.findByDateRange(startDate, endDate),
			incomeQueries.findByDateRange(startDate, endDate),
			recurringQueries.findAll(),
			budgetQueries.findByYear(year),
			getGoalsWithProgress()
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

	const elapsedMonths = year === currentYear ? new Date().getMonth() + 1 : 12;
	const recurringYearlyTotal = recurringExpenses.reduce((sum, item) => {
		if (item.cadence === 'Monthly') {
			return sum + item.amount * elapsedMonths;
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
		timeRangeData,
		goalsWithProgress
	};
};
