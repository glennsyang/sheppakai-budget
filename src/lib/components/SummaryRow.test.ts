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

	it('renders default (non-emphasized) variant without bold/2xl classes', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'Recurring',
				amount: 150
			}
		}).body;

		expect(html).toContain('text-lg font-semibold');
		expect(html).not.toContain('text-2xl font-bold');
	});

	it('renders $0.00 for a zero amount', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'Nothing',
				amount: 0
			}
		}).body;

		expect(html).toContain('$0.00');
	});

	it('does not render border-t when bordered is false', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'No border',
				amount: 100,
				bordered: false
			}
		}).body;

		expect(html).not.toContain('border-t');
	});

	it('renders muted text style by default', () => {
		const html = render(SummaryRow, {
			props: {
				label: 'Default muted',
				amount: 100
			}
		}).body;

		expect(html).toContain('text-muted-foreground');
	});
});
