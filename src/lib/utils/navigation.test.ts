import { describe, expect, it } from 'vitest';

import { classifyNavigation } from './navigation';

describe('classifyNavigation', () => {
	it('returns idle when no navigation is in flight', () => {
		expect(classifyNavigation(undefined, '/(app)/finances/income')).toBe('idle');
	});

	it('returns idle even when the current route is unknown', () => {
		expect(classifyNavigation(undefined, null)).toBe('idle');
	});

	it('returns same-route for a month switch on the current route', () => {
		expect(classifyNavigation('/(app)/finances/income', '/(app)/finances/income')).toBe(
			'same-route'
		);
	});

	it('returns cross-route when navigating to a different route', () => {
		expect(classifyNavigation('/(app)/dashboard', '/(app)/finances/income')).toBe('cross-route');
	});

	it('returns cross-route when the target is not a SvelteKit route', () => {
		expect(classifyNavigation(null, '/(app)/finances/income')).toBe('cross-route');
	});

	it('returns same-route when both route ids are null', () => {
		expect(classifyNavigation(null, null)).toBe('same-route');
	});
});
