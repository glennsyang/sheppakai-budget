import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';

import MonthlyTablePageShell from './MonthlyTablePageShell.svelte';

vi.mock('$app/state', () => ({
	navigating: { to: null },
	page: { route: { id: '/(app)/income' } }
}));

const tableContent = createRawSnippet(() => ({ render: () => '<p>table-marker</p>' }));
const summaryContent = createRawSnippet(() => ({ render: () => '<p>summary-marker</p>' }));

function renderShell(loadError?: string): string {
	return render(MonthlyTablePageShell, {
		props: {
			title: 'Income',
			selectedMonth: 1,
			selectedYear: 2026,
			onMonthYearChange: () => {},
			onMonthJump: () => {},
			tableContent,
			summaryContent,
			loadError
		}
	}).body;
}

describe('MonthlyTablePageShell', () => {
	it('renders the table and summary when the load succeeded', () => {
		const html = renderShell();

		expect(html).toContain('table-marker');
		expect(html).toContain('summary-marker');
		expect(html).not.toContain('role="alert"');
	});

	it('replaces the table and hides the summary when the load failed', () => {
		const html = renderShell('Failed to load income data.');

		expect(html).toContain('role="alert"');
		expect(html).toContain('Failed to load income data.');
		expect(html).not.toContain('table-marker');
		expect(html).not.toContain('summary-marker');
	});
});
