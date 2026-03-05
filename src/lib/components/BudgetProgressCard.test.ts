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
});
