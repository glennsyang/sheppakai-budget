import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import SummaryRow from './SummaryRow.svelte';

describe('SummaryRow', () => {
	it('renders label and formatted amount', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'Total Savings',
				amount: 1234.56
			}
		}).body;

		expect(html).toContain('Total Savings');
		expect(html).toContain('$1,234.56');
	});

	it('renders emphasized and non-muted styles when configured', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'Remaining',
				amount: 250,
				emphasized: true,
				muted: false,
				bordered: true
			}
		}).body;

		expect(html).toContain('Remaining');
		expect(html).toContain('text-2xl font-bold');
		expect(html).toContain('border-t pt-4');
		expect(html).not.toContain('text-muted-foreground');
	});
});
