import { describe, expect, it } from 'vitest';

import { classifyNavigation, matchNavUrl } from './navigation';

describe('classifyNavigation', () => {
	it('returns idle when no navigation is in flight', () => {
		expect(classifyNavigation(undefined, '/(app)/income')).toBe('idle');
	});

	it('returns idle even when the current route is unknown', () => {
		expect(classifyNavigation(undefined, null)).toBe('idle');
	});

	it('returns same-route for a month switch on the current route', () => {
		expect(classifyNavigation('/(app)/income', '/(app)/income')).toBe('same-route');
	});

	it('returns cross-route when navigating to a different route', () => {
		expect(classifyNavigation('/(app)/dashboard', '/(app)/income')).toBe('cross-route');
	});

	it('returns cross-route when the target is not a SvelteKit route', () => {
		expect(classifyNavigation(null, '/(app)/income')).toBe('cross-route');
	});

	it('returns same-route when both route ids are null', () => {
		expect(classifyNavigation(null, null)).toBe('same-route');
	});
});

describe('matchNavUrl', () => {
	const urls = ['/dashboard', '/window-cleaning', '/window-cleaning/jobs', '/savings', undefined];

	it('prefers the longest matching URL', () => {
		expect(matchNavUrl('/window-cleaning/jobs', urls)).toBe('/window-cleaning/jobs');
		expect(matchNavUrl('/window-cleaning', urls)).toBe('/window-cleaning');
	});

	it('matches child paths but not prefixes of other words', () => {
		expect(matchNavUrl('/savings/goals', urls)).toBe('/savings');
		expect(matchNavUrl('/savingsx', urls)).toBeNull();
	});

	it('returns null when nothing matches', () => {
		expect(matchNavUrl('/profile', urls)).toBeNull();
	});
});
