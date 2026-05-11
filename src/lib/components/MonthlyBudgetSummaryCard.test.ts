import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import MonthlyBudgetSummaryCard from './MonthlyBudgetSummaryCard.svelte';

describe('MonthlyBudgetSummaryCard', () => {
	it('renders net balance in the on-track (positive) state', () => {
		const html = render(MonthlyBudgetSummaryCard, {
			props: {
				actualSpent: 800,
				plannedBudget: 1200,
				totalIncome: 3000
			}
		}).body;

		// Net balance = 3000 - 800 = +2200
		expect(html).toContain('$2,200.00');
		expect(html).toContain('On track this month');
		expect(html).not.toContain('Overspent this month');
	});

	it('renders overspent state when actual spent exceeds income', () => {
		const html = render(MonthlyBudgetSummaryCard, {
			props: {
				actualSpent: 3500,
				plannedBudget: 4000,
				totalIncome: 3000
			}
		}).body;

		// Net balance = 3000 - 3500 = -500
		expect(html).toContain('$500.00');
		expect(html).toContain('Overspent this month');
		expect(html).not.toContain('On track this month');
	});

	it('renders skeleton placeholders in loading state', () => {
		const html = render(MonthlyBudgetSummaryCard, {
			props: {
				actualSpent: 500,
				plannedBudget: 1000,
				totalIncome: 2000,
				loading: true
			}
		}).body;

		expect(html).toContain('animate-pulse');
		// Should NOT render the actual dollar amounts while loading
		expect(html).not.toContain('On track this month');
		expect(html).not.toContain('Overspent this month');
	});

	it('shows zero net balance when income equals actual spent', () => {
		const html = render(MonthlyBudgetSummaryCard, {
			props: {
				actualSpent: 2000,
				plannedBudget: 2500,
				totalIncome: 2000
			}
		}).body;

		expect(html).toContain('$0.00');
	});
});
