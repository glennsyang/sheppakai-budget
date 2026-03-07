import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import PeriodProgressCard from './PeriodProgressCard.svelte';

describe('PeriodProgressCard', () => {
	it('rounds partial progress up to the next whole percent', () => {
		const html = render(PeriodProgressCard, {
			props: {
				label: 'Month Progress',
				title: 'March 2026',
				progress: {
					kind: 'month',
					elapsedUnits: 6,
					totalUnits: 31,
					percentage: (6 / 31) * 100,
					status: 'current',
					unit: 'day'
				}
			}
		}).body;

		expect(html).toContain('Month Progress');
		expect(html).toContain('March 2026');
		expect(html).toContain('20%');
		expect(html).toContain('6 of 31 days elapsed');
	});

	it('renders year progress using elapsed months', () => {
		const html = render(PeriodProgressCard, {
			props: {
				label: 'Year Progress',
				title: '2026',
				progress: {
					kind: 'year',
					elapsedUnits: 2,
					totalUnits: 12,
					percentage: (2 / 12) * 100,
					status: 'current',
					unit: 'month'
				}
			}
		}).body;

		expect(html).toContain('Year Progress');
		expect(html).toContain('2026');
		expect(html).toContain('17%');
		expect(html).toContain('2 of 12 months elapsed');
	});
});
