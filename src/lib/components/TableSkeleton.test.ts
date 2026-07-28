import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import TableSkeleton from './TableSkeleton.svelte';

function countSkeletons(html: string): number {
	return html.split('data-slot="skeleton"').length - 1;
}

describe('TableSkeleton', () => {
	it('renders a header row plus the requested body rows', () => {
		const html = render(TableSkeleton, { props: { rows: 3, columns: 4 } }).body;

		// (3 body rows + 1 header row) * 4 columns
		expect(countSkeletons(html)).toBe(16);
	});

	it('defaults to a 5x5 grid', () => {
		const html = render(TableSkeleton).body;

		expect(countSkeletons(html)).toBe(30);
	});

	it('renders pulsing placeholders', () => {
		const html = render(TableSkeleton, { props: { rows: 1, columns: 1 } }).body;

		expect(html).toContain('animate-pulse');
	});

	it('exposes a status role with an accessible label', () => {
		const html = render(TableSkeleton, { props: { rows: 1, columns: 1 } }).body;

		expect(html).toContain('role="status"');
		expect(html).toContain('Loading table data');
	});

	it('cycles column widths from the defined scale only', () => {
		const html = render(TableSkeleton, { props: { rows: 1, columns: 8 } }).body;

		// w-18 and w-30 are not on Tailwind's default scale and must not appear
		expect(html).not.toContain('w-18');
		expect(html).not.toContain('w-30');
		expect(html).toContain('w-24');
	});

	it('renders nothing but the header when rows is zero', () => {
		const html = render(TableSkeleton, { props: { rows: 0, columns: 3 } }).body;

		expect(countSkeletons(html)).toBe(3);
	});
});
