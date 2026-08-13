import { describe, expect, it } from 'vitest';

import { apiBudgetsQuerySchema } from './budgets';

describe('apiBudgetsQuerySchema', () => {
	it('accepts year alone', () => {
		expect(apiBudgetsQuerySchema.safeParse({ year: '2026' }).success).toBe(true);
	});

	it('accepts month and year', () => {
		expect(apiBudgetsQuerySchema.safeParse({ month: '8', year: '2026' }).success).toBe(true);
	});

	it('rejects a missing year', () => {
		expect(apiBudgetsQuerySchema.safeParse({ month: '8' }).success).toBe(false);
		expect(apiBudgetsQuerySchema.safeParse({}).success).toBe(false);
	});

	it('rejects an out-of-range month', () => {
		expect(apiBudgetsQuerySchema.safeParse({ month: '13', year: '2026' }).success).toBe(false);
	});
});
