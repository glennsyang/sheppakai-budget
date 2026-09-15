import { describe, expect, it } from 'vitest';

import {
	apiCreateWindowCleaningJobSchema,
	apiWindowCleaningJobListQuerySchema
} from './window-cleaning-jobs';

describe('apiCreateWindowCleaningJobSchema', () => {
	const valid = {
		customerId: 'cust-1',
		jobDate: '2026-08-12',
		amountCharged: 120,
		tip: 20
	};

	it('accepts a valid body', () => {
		expect(apiCreateWindowCleaningJobSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a missing customerId', () => {
		expect(apiCreateWindowCleaningJobSchema.safeParse({ ...valid, customerId: '' }).success).toBe(
			false
		);
	});

	it('rejects a malformed date', () => {
		expect(
			apiCreateWindowCleaningJobSchema.safeParse({ ...valid, jobDate: '08/12/2026' }).success
		).toBe(false);
	});

	it('rejects a non-positive amountCharged', () => {
		expect(apiCreateWindowCleaningJobSchema.safeParse({ ...valid, amountCharged: 0 }).success).toBe(
			false
		);
	});

	it('rejects a negative tip', () => {
		expect(apiCreateWindowCleaningJobSchema.safeParse({ ...valid, tip: -5 }).success).toBe(false);
	});

	it('rejects an id field (server-generated)', () => {
		const result = apiCreateWindowCleaningJobSchema.safeParse({ ...valid, id: 'client-supplied' });
		expect(result.success && !('id' in result.data)).toBe(true);
	});
});

describe('apiWindowCleaningJobListQuerySchema', () => {
	it('accepts no filters', () => {
		expect(apiWindowCleaningJobListQuerySchema.safeParse({}).success).toBe(true);
	});

	it('accepts a customerId filter', () => {
		expect(apiWindowCleaningJobListQuerySchema.safeParse({ customerId: 'cust-1' }).success).toBe(
			true
		);
	});

	it('accepts month and year together', () => {
		expect(apiWindowCleaningJobListQuerySchema.safeParse({ month: 8, year: 2026 }).success).toBe(
			true
		);
	});

	it('rejects month without year', () => {
		expect(apiWindowCleaningJobListQuerySchema.safeParse({ month: 8 }).success).toBe(false);
	});

	it('accepts year alone', () => {
		expect(apiWindowCleaningJobListQuerySchema.safeParse({ year: 2026 }).success).toBe(true);
	});
});
