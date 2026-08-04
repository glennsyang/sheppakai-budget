import type {
	CategoryAnomaly,
	ExcludedSpendCategory,
	SavingsGoalWithProgress,
	TimeRangeInOutData,
	Transaction
} from '$lib';
import { dashboardVisibilitySchema, transactionSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { requireUser } from '$lib/server/auth-guard-load';
import { getDb } from '$lib/server/db';
import {
	budgetQueries,
	dashboardPreferenceQueries,
	incomeQueries,
	recurringQueries,
	savingsGoalQueries,
	savingsQueries,
	transactionQueries
} from '$lib/server/db/queries';
import { contribution } from '$lib/server/db/schema';
import { computeCategoryAnomalies } from '$lib/server/insights/category-anomalies';
import { logger } from '$lib/server/logger';
import { monthNames } from '$lib/utils';
import {
	getCalendarYearMonthsRange,
	getMonthDateRange,
	getMonthRangeFromUrl,
	getPreviousMonthsRange,
	getYearDateRange
} from '$lib/utils/dates';
import { inArray, sum } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

type RecurringItem = { cadence: string; amount: number };

function calcMonthlyRecurringTotal(items: RecurringItem[]): number {
	return items.reduce((acc, item) => {
		if (item.cadence === 'Monthly') return acc + item.amount;
		if (item.cadence === 'Yearly') return acc + item.amount / 12;
		return acc;
	}, 0);
}

function calcYearlyRecurringTotal(items: RecurringItem[], elapsedMonths: number): number {
	return items.reduce((acc, item) => {
		if (item.cadence === 'Monthly') return acc + item.amount * elapsedMonths;
		if (item.cadence === 'Yearly') return acc + item.amount;
		return acc;
	}, 0);
}

function groupExcludedByCategory(excludedExpenses: Transaction[]): ExcludedSpendCategory[] {
	const totals = new Map<string, ExcludedSpendCategory>();

	for (const expense of excludedExpenses) {
		const categoryId = expense.category?.id ?? null;
		const categoryName = expense.category?.name ?? 'Uncategorized';
		const key = categoryId ?? '__uncategorized__';
		const existing = totals.get(key);
		if (existing) {
			existing.amount += expense.amount;
		} else {
			totals.set(key, { categoryId, categoryName, amount: expense.amount });
		}
	}

	return [...totals.values()].sort((a, b) => b.amount - a.amount);
}

async function getGoalsWithProgress(): Promise<SavingsGoalWithProgress[]> {
	const goals = await savingsGoalQueries.findAll();
	const includedGoals = goals.filter((g) => g.status !== 'archived');

	if (includedGoals.length === 0) return [];

	const includedGoalIds = includedGoals.map((g) => g.id);

	const totalsRows = await getDb()
		.select({ goalId: contribution.goalId, total: sum(contribution.amount) })
		.from(contribution)
		.where(inArray(contribution.goalId, includedGoalIds))
		.groupBy(contribution.goalId);

	const totalsMap = new Map(totalsRows.map((r) => [r.goalId, Number(r.total ?? 0)]));

	return includedGoals.map((goal) => {
		const total = totalsMap.get(goal.id) ?? 0;
		const percentage = goal.targetAmount > 0 ? (total / goal.targetAmount) * 100 : 0;
		return { ...goal, currentAmount: total, percentage: Math.min(percentage, 100) };
	});
}

async function loadMonthlyDashboard(url: URL) {
	const { month, year, startDate, endDate } = getMonthRangeFromUrl(url);

	const [
		actualExpenses,
		excludedExpenses,
		plannedExpenses,
		recurringExpenses,
		incomeRecords,
		goalsWithProgress,
		totalSavings
	] = await Promise.all([
		transactionQueries.findByDateRangeIncludedInBudget(startDate, endDate),
		transactionQueries.findByDateRangeExcludedFromBudget(startDate, endDate),
		budgetQueries.findByMonthYear(month, year),
		recurringQueries.findAll(),
		incomeQueries.findByDateRange(startDate, endDate),
		getGoalsWithProgress(),
		savingsQueries.getTotal()
	]);

	const recurringMonthlyTotal = calcMonthlyRecurringTotal(recurringExpenses);
	const excludedExpensesTotal = excludedExpenses.reduce((acc, e) => acc + e.amount, 0);
	const excludedExpensesBreakdown = groupExcludedByCategory(excludedExpenses);
	const actualExpensesTotal =
		actualExpenses.reduce((acc, e) => acc + e.amount, 0) + recurringMonthlyTotal;
	const plannedExpensesTotal =
		plannedExpenses.reduce((acc, b) => acc + b.amount, 0) + recurringMonthlyTotal;
	const totalIncome = incomeRecords.reduce((acc, inc) => acc + inc.amount, 0);
	const remainingBalance = totalIncome - plannedExpensesTotal;

	const historicalMonths: Array<{
		targetMonth: number;
		targetYear: number;
		monthStart: string;
		monthEnd: string;
	}> = [];
	let chartEnd = '';

	for (let i = 5; i >= 0; i--) {
		const targetDate = new Date(year, month - 1 - i, 1);
		if (targetDate > new Date()) continue;

		const targetMonth = targetDate.getMonth() + 1;
		const targetYear = targetDate.getFullYear();
		const { startDate: monthStart, endDate: monthEnd } = getMonthDateRange(targetMonth, targetYear);
		historicalMonths.push({ targetMonth, targetYear, monthStart, monthEnd });
		chartEnd = monthEnd;
	}

	const monthlyInOutData: TimeRangeInOutData[] = [];
	let categoryAnomalies: CategoryAnomaly[] = [];

	if (historicalMonths.length > 0) {
		const chartStart = historicalMonths[0].monthStart;

		const [allChartTx, allChartIncome] = await Promise.all([
			transactionQueries.findByDateRangeIncludedInBudget(chartStart, chartEnd),
			incomeQueries.findByDateRange(chartStart, chartEnd)
		]);

		for (const { targetMonth, monthStart, monthEnd } of historicalMonths) {
			const monthTx = allChartTx.filter(
				(t) => t.date.substring(0, 10) >= monthStart && t.date.substring(0, 10) <= monthEnd
			);
			const monthInc = allChartIncome.filter(
				(inc) => inc.date.substring(0, 10) >= monthStart && inc.date.substring(0, 10) <= monthEnd
			);

			monthlyInOutData.push({
				month: monthNames[targetMonth - 1],
				in: monthInc.reduce((acc, inc) => acc + inc.amount, 0),
				out: monthTx.reduce((acc, t) => acc + t.amount, 0) + recurringMonthlyTotal
			});
		}

		categoryAnomalies = computeCategoryAnomalies(allChartTx, historicalMonths);
	}

	const netflowSparkline = monthlyInOutData.map((d) => ({ month: d.month, value: d.in - d.out }));
	const spendingSparkline = monthlyInOutData.map((d) => ({ month: d.month, value: d.out }));

	return {
		mode: 'monthly',
		month,
		year,
		actualExpenses,
		plannedExpenses,
		recurringExpenses,
		actualExpensesTotal,
		excludedExpensesTotal,
		excludedExpensesBreakdown,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance,
		monthlyInOutData,
		netflowSparkline,
		spendingSparkline,
		categoryAnomalies,
		goalsWithProgress,
		totalSavings
	};
}

async function loadYearlyDashboard(url: URL) {
	const currentYear = new Date().getFullYear();
	const view = url.searchParams.get('view') === 'full' ? 'full' : 'current';
	const yearParam = url.searchParams.get('year');
	const year = yearParam ? Number.parseInt(yearParam) : currentYear;
	const { startDate, endDate } = getYearDateRange(year);

	const [
		actualExpenses,
		excludedExpenses,
		incomeRecords,
		recurringExpenses,
		allYearBudgets,
		goalsWithProgress,
		totalSavings
	] = await Promise.all([
		transactionQueries.findByDateRangeIncludedInBudget(startDate, endDate),
		transactionQueries.findByDateRangeExcludedFromBudget(startDate, endDate),
		incomeQueries.findByDateRange(startDate, endDate),
		recurringQueries.findAll(),
		budgetQueries.findByYear(year),
		getGoalsWithProgress(),
		savingsQueries.getTotal()
	]);

	const yearlyBudgets: Array<{ categoryId: string; amount: number }> = [];
	allYearBudgets.forEach((b) => {
		const existing = yearlyBudgets.find((e) => e.categoryId === b.category?.id);
		if (existing) {
			existing.amount += b.amount;
		} else if (b.category) {
			yearlyBudgets.push({ categoryId: b.category.id, amount: b.amount });
		}
	});

	const elapsedMonths = year === currentYear ? new Date().getMonth() + 1 : 12;
	const recurringYearlyTotal = calcYearlyRecurringTotal(recurringExpenses, elapsedMonths);
	const excludedExpensesTotal = excludedExpenses.reduce((acc, e) => acc + e.amount, 0);
	const excludedExpensesBreakdown = groupExcludedByCategory(excludedExpenses);
	const actualExpensesTotal =
		actualExpenses.reduce((acc, e) => acc + e.amount, 0) + recurringYearlyTotal;
	const plannedExpensesTotal =
		yearlyBudgets.reduce((acc, b) => acc + b.amount, 0) + recurringYearlyTotal;
	const totalIncome = incomeRecords.reduce((acc, inc) => acc + inc.amount, 0);
	const remainingBalance = totalIncome - plannedExpensesTotal;

	const monthRanges =
		view === 'current' && year === currentYear
			? getPreviousMonthsRange(6)
			: getCalendarYearMonthsRange(year);

	const timeRangeData: TimeRangeInOutData[] = [];

	if (monthRanges.length > 0) {
		const chartStart = monthRanges[0].startDate;
		const chartEnd = monthRanges[monthRanges.length - 1].endDate;
		const monthlyRecurringTotal = calcMonthlyRecurringTotal(recurringExpenses);

		const [allChartTx, allChartIncome] = await Promise.all([
			transactionQueries.findByDateRangeIncludedInBudget(chartStart, chartEnd),
			incomeQueries.findByDateRange(chartStart, chartEnd)
		]);

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
				in: monthInc.reduce((acc, inc) => acc + inc.amount, 0),
				out: monthTx.reduce((acc, t) => acc + t.amount, 0) + monthlyRecurringTotal
			});
		}
	}

	return {
		mode: 'yearly',
		view,
		year,
		actualExpenses,
		yearlyBudgets,
		allYearBudgets,
		actualExpensesTotal,
		excludedExpensesTotal,
		excludedExpensesBreakdown,
		plannedExpensesTotal,
		totalIncome,
		remainingBalance,
		timeRangeData,
		goalsWithProgress,
		totalSavings
	};
}

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = requireUser(locals);
	const mode = url.searchParams.get('mode') === 'yearly' ? 'yearly' : 'monthly';

	const [dashboardData, hiddenSections, transactionForm] = await Promise.all([
		mode === 'monthly' ? loadMonthlyDashboard(url) : loadYearlyDashboard(url),
		dashboardPreferenceQueries.findHiddenKeysByUserId(user.id),
		superValidate(zod4(transactionSchema))
	]);

	const dashboardVisibilityForm = await superValidate(
		{ hiddenSections },
		zod4(dashboardVisibilitySchema)
	);

	return { ...dashboardData, hiddenSections, dashboardVisibilityForm, transactionForm };
};

export const actions = {
	updateVisibility: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(dashboardVisibilitySchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
		}

		try {
			await dashboardPreferenceQueries.setHiddenKeys(user.id, form.data.hiddenSections);
			return message(form, { type: 'success', text: 'Dashboard preferences updated.' });
		} catch (error) {
			logger.error('Failed to update dashboard section preferences', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update dashboard preferences. Please try again.' },
				{ status: 500 }
			);
		}
	})
} satisfies Actions;
