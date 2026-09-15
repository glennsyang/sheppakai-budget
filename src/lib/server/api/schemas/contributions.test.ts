import { describe, expect, it } from 'vitest';

import { apiCreateContributionSchema } from './contributions';

describe('apiCreateContributionSchema', () => {
	const valid = {
		amount: 100,
		date: '2026-08-12',
		description: 'Monthly deposit'
	};

	it('accepts a valid body', () => {
		expect(apiCreateContributionSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a non-positive amount', () => {
		expect(apiCreateContributionSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
	});

	it('rejects a malformed date', () => {
		expect(apiCreateContributionSchema.safeParse({ ...valid, date: '08/12/2026' }).success).toBe(
			false
		);
	});

	it('rejects an id field (server-generated)', () => {
		const result = apiCreateContributionSchema.safeParse({ ...valid, id: 'client-supplied' });
		expect(result.success && !('id' in result.data)).toBe(true);
	});

	it('rejects a goalId field (taken from the URL param, not the body)', () => {
		const result = apiCreateContributionSchema.safeParse({ ...valid, goalId: 'goal-1' });
		expect(result.success && !('goalId' in result.data)).toBe(true);
	});
});
