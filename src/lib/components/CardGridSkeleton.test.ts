import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import CardGridSkeleton from './CardGridSkeleton.svelte';

function countSkeletons(html: string): number {
	return html.split('data-slot="skeleton"').length - 1;
}

describe('CardGridSkeleton', () => {
	it('renders one title bar plus the requested body lines per card', () => {
		const html = render(CardGridSkeleton, { props: { cards: 3, linesPerCard: 2 } }).body;

		// 3 cards * (1 title + 2 lines)
		expect(countSkeletons(html)).toBe(9);
	});

	it('defaults to two cards with two lines each', () => {
		const html = render(CardGridSkeleton).body;

		expect(countSkeletons(html)).toBe(6);
	});

	it('reuses the card frame so the layout does not shift on swap', () => {
		const html = render(CardGridSkeleton, { props: { cards: 1 } }).body;

		expect(html).toContain('overflow-hidden rounded-lg border shadow');
	});

	it('applies the caller-supplied container classes', () => {
		const html = render(CardGridSkeleton, {
			props: { cards: 4, class: 'grid grid-cols-2 gap-4 sm:grid-cols-4' }
		}).body;

		expect(html).toContain('grid grid-cols-2 gap-4 sm:grid-cols-4');
	});

	it('applies a custom line height for chart-sized placeholders', () => {
		const html = render(CardGridSkeleton, {
			props: { cards: 1, linesPerCard: 1, lineClass: 'h-40' }
		}).body;

		expect(html).toContain('h-40');
	});

	it('exposes a status role with a customizable label', () => {
		const html = render(CardGridSkeleton, {
			props: { cards: 1, label: 'Loading dashboard' }
		}).body;

		expect(html).toContain('role="status"');
		expect(html).toContain('Loading dashboard');
	});

	it('renders pulsing placeholders', () => {
		const html = render(CardGridSkeleton, { props: { cards: 1 } }).body;

		expect(html).toContain('animate-pulse');
	});
});
