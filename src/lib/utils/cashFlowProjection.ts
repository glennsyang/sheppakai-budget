export interface CashFlowProjectionInput {
	totalIncome: number;
	actualSpent: number;
	recurringMonthlyTotal: number;
	plannedExpensesTotal: number;
	month: number;
	year: number;
	referenceDate?: Date;
}

export interface CashFlowProjection {
	daysInMonth: number;
	daysElapsed: number;
	/** Days strictly after today; used for projecting spend on top of actualSpent (which already covers today). */
	daysRemaining: number;
	/** Days from today through month-end, inclusive; used for "how much can I still spend" metrics. */
	daysRemainingInclusive: number;
	dailyBurnRate: number;
	projectedEnd: number;
	projectionPercent: number;
	nonRecurringSpent: number;
	discretionaryRemaining: number;
	dailyDiscretionary: number;
	budgetRemaining: number;
	dailyBudgetRemaining: number;
}

export function computeCashFlowProjection({
	totalIncome,
	actualSpent,
	recurringMonthlyTotal,
	plannedExpensesTotal,
	month,
	year,
	referenceDate = new Date()
}: CashFlowProjectionInput): CashFlowProjection {
	const daysInMonth = new Date(year, month, 0).getDate();
	const currentDay =
		referenceDate.getFullYear() === year && referenceDate.getMonth() + 1 === month
			? referenceDate.getDate()
			: daysInMonth;
	const daysElapsed = Math.max(currentDay, 1);
	const daysRemaining = Math.max(daysInMonth - currentDay, 0);
	const daysRemainingInclusive = Math.max(daysInMonth - currentDay + 1, 1);

	const nonRecurringSpent = Math.max(0, actualSpent - recurringMonthlyTotal);
	const dailyBurnRate = nonRecurringSpent / daysElapsed;
	const projectedEnd = actualSpent + dailyBurnRate * daysRemaining;
	const projectionPercent = totalIncome > 0 ? Math.min((projectedEnd / totalIncome) * 100, 100) : 0;

	const discretionaryRemaining = totalIncome - nonRecurringSpent - recurringMonthlyTotal;
	const dailyDiscretionary = Math.max(discretionaryRemaining, 0) / daysRemainingInclusive;

	const budgetRemaining = Math.max(0, plannedExpensesTotal - actualSpent);
	const dailyBudgetRemaining = budgetRemaining / daysRemainingInclusive;

	return {
		daysInMonth,
		daysElapsed,
		daysRemaining,
		daysRemainingInclusive,
		dailyBurnRate,
		projectedEnd,
		projectionPercent,
		nonRecurringSpent,
		discretionaryRemaining,
		dailyDiscretionary,
		budgetRemaining,
		dailyBudgetRemaining
	};
}
