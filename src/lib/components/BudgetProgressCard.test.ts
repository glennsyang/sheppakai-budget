import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import BudgetProgressCard from './BudgetProgressCard.svelte';

describe('BudgetProgressCard', () => {
	it('renders planned, actual, and remaining values when under plan', () => {
		const html = render(BudgetProgressCard, {
			props: {
				title: 'March Budget',
				actual: 800,
				planned: 1000,
				cardType: 'budget',
				label1: 'Spent'
			}
		}).body;

		expect(html).toContain('March Budget');
		expect(html).toContain('$1,000.00');
		expect(html).toContain('Spent: $800.00');
		expect(html).toContain('80.0%');
		expect(html).toContain('Remaining: $200.00');
	});

	it('renders over-budget messaging for income card type', () => {
		const html = render(BudgetProgressCard, {
			props: {
				title: 'Income Plan',
				actual: 1200,
				planned: 1000,
				cardType: 'income',
				label1: 'Spent'
			}
		}).body;

		expect(html).toContain('Income Plan');
		expect(html).toContain('120.0%');
		expect(html).toContain('Overspent by');
		expect(html).toContain('$200.00');
	});

	it('renders skeleton placeholders in loading state and hides card content', () => {
		const html = render(BudgetProgressCard, {
			props: {
				title: 'March Budget',
				actual: 800,
				planned: 1000,
				cardType: 'budget',
				label1: 'Spent',
				loading: true
			}
		}).body;

		// Skeleton element renders with its size classes
		expect(html).toContain('h-4 w-full');
		// Card content should not be rendered while loading
		expect(html).not.toContain('March Budget');
		expect(html).not.toContain('$1,000.00');
	});

	it('handles planned=0 without crashing and shows 0%', () => {
		const html = render(BudgetProgressCard, {
			props: {
				title: 'Empty Budget',
				actual: 0,
				planned: 0,
				cardType: 'budget',
				label1: 'Spent'
			}
		}).body;

		expect(html).toContain('0.0%');
		expect(html).not.toContain('Over budget by');
		expect(html).not.toContain('Remaining:');
	});

	it('renders warning-class progress bar and no remaining/over-budget text at 92%', () => {
		// isWarning = percentage >= 90 && percentage <= 100
		const html = render(BudgetProgressCard, {
			props: {
				title: 'Near Limit',
				actual: 920,
				planned: 1000,
				cardType: 'budget',
				label1: 'Spent'
			}
		}).body;

		expect(html).toContain('92.0%');
		expect(html).toContain('progress-warning');
		// isUnderBudget is false when isWarning, so neither block renders
		expect(html).not.toContain('Remaining:');
		expect(html).not.toContain('Over budget by');
	});
});
