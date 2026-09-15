import { describe, expect, it } from 'vitest';

import { apiMarkRecurringPaidSchema } from './recurring';

describe('apiMarkRecurringPaidSchema', () => {
	it('accepts paid: true', () => {
		expect(apiMarkRecurringPaidSchema.safeParse({ paid: true }).success).toBe(true);
	});

	it('accepts paid: false', () => {
		expect(apiMarkRecurringPaidSchema.safeParse({ paid: false }).success).toBe(true);
	});

	it('rejects a missing paid field', () => {
		expect(apiMarkRecurringPaidSchema.safeParse({}).success).toBe(false);
	});

	it('rejects a non-boolean paid field', () => {
		expect(apiMarkRecurringPaidSchema.safeParse({ paid: 'yes' }).success).toBe(false);
	});
});
