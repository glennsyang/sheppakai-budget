import { describe, expect, it } from 'vitest';

import { computeCashFlowProjection } from './cashFlowProjection';

describe('computeCashFlowProjection', () => {
	it('does not smear a fixed recurring cost across the daily burn rate (issue #335)', () => {
		// Aug 5, 2026: 5 days elapsed, 26 days remaining, 31 days in month.
		// $150 of real (non-recurring) spend so far, $1,800/mo recurring committed.
		const result = computeCashFlowProjection({
			totalIncome: 5000,
			actualSpent: 1950, // 150 non-recurring + 1800 recurring
			recurringMonthlyTotal: 1800,
			plannedExpensesTotal: 4000,
			month: 8,
			year: 2026,
			referenceDate: new Date(2026, 7, 5)
		});

		expect(result.nonRecurringSpent).toBe(150);
		expect(result.dailyBurnRate).toBeCloseTo(30); // 150 / 5, not 1950 / 5
		expect(result.projectedEnd).toBeCloseTo(2730); // 1950 + 30 * 26, not the buggy ~12,090
	});

	it('reduces to simple linear extrapolation of actual spend when there is no recurring cost', () => {
		const result = computeCashFlowProjection({
			totalIncome: 5000,
			actualSpent: 310,
			recurringMonthlyTotal: 0,
			plannedExpensesTotal: 4000,
			month: 8,
			year: 2026,
			referenceDate: new Date(2026, 7, 5)
		});

		expect(result.dailyBurnRate).toBeCloseTo(62); // 310 / 5
		expect(result.projectedEnd).toBeCloseTo(1922); // 310 + 62 * 26
	});

	it('projects to exactly the current spend on the last day of the month', () => {
		const result = computeCashFlowProjection({
			totalIncome: 5000,
			actualSpent: 3200,
			recurringMonthlyTotal: 1800,
			plannedExpensesTotal: 4000,
			month: 8,
			year: 2026,
			referenceDate: new Date(2026, 7, 31)
		});

		expect(result.daysRemaining).toBe(0);
		expect(result.projectedEnd).toBe(3200);
	});

	it('clamps to month-end when viewing a past or future month', () => {
		const pastMonth = computeCashFlowProjection({
			totalIncome: 5000,
			actualSpent: 2500,
			recurringMonthlyTotal: 1800,
			plannedExpensesTotal: 4000,
			month: 6,
			year: 2026,
			referenceDate: new Date(2026, 7, 5) // viewing June from August
		});
		expect(pastMonth.daysElapsed).toBe(pastMonth.daysInMonth);
		expect(pastMonth.daysRemaining).toBe(0);
		expect(pastMonth.projectedEnd).toBe(2500);

		const futureMonth = computeCashFlowProjection({
			totalIncome: 5000,
			actualSpent: 0,
			recurringMonthlyTotal: 1800,
			plannedExpensesTotal: 4000,
			month: 12,
			year: 2026,
			referenceDate: new Date(2026, 7, 5) // viewing December from August
		});
		expect(futureMonth.daysElapsed).toBe(futureMonth.daysInMonth);
		expect(futureMonth.daysRemaining).toBe(0);
		expect(futureMonth.projectedEnd).toBe(0);
	});

	it('caps projectionPercent at 100 and leaves unrelated fields correct', () => {
		const result = computeCashFlowProjection({
			totalIncome: 1000,
			actualSpent: 2100, // 100 non-recurring + 2000 recurring
			recurringMonthlyTotal: 2000,
			plannedExpensesTotal: 2500,
			month: 8,
			year: 2026,
			referenceDate: new Date(2026, 7, 5)
		});

		// projectedEnd = 2100 + (100/5)*26 = 2620, well over totalIncome of 1000
		expect(result.projectedEnd).toBeCloseTo(2620);
		expect(result.projectionPercent).toBe(100);

		// discretionaryRemaining = totalIncome - nonRecurringSpent - recurringMonthlyTotal
		expect(result.discretionaryRemaining).toBeCloseTo(1000 - 100 - 2000);

		// budgetRemaining = max(0, plannedExpensesTotal - actualSpent) = max(0, 2500 - 2100)
		expect(result.budgetRemaining).toBeCloseTo(400);
		// daysRemainingInclusive = 31 - 5 + 1 = 27
		expect(result.dailyBudgetRemaining).toBeCloseTo(400 / 27);
	});
});
