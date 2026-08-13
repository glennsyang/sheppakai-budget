import { describe, expect, it } from 'vitest';

import { apiDashboardQuerySchema } from './dashboard';

describe('apiDashboardQuerySchema', () => {
	it('accepts no params', () => {
		expect(apiDashboardQuerySchema.safeParse({}).success).toBe(true);
	});

	it('accepts a full set of valid params', () => {
		expect(
			apiDashboardQuerySchema.safeParse({ mode: 'yearly', year: '2026', view: 'full' }).success
		).toBe(true);
	});

	it('rejects an invalid mode', () => {
		expect(apiDashboardQuerySchema.safeParse({ mode: 'weekly' }).success).toBe(false);
	});

	it('rejects an out-of-range month', () => {
		expect(apiDashboardQuerySchema.safeParse({ month: '0' }).success).toBe(false);
	});
});
