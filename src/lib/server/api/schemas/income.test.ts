import { describe, expect, it } from 'vitest';

import { apiCreateIncomeSchema, apiIncomeListQuerySchema } from './income';

describe('apiCreateIncomeSchema', () => {
	const valid = {
		name: 'Freelance payment',
		description: 'Invoice #42',
		date: '2026-08-12',
		amount: 500
	};

	it('accepts a valid body', () => {
		expect(apiCreateIncomeSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a non-positive amount', () => {
		expect(apiCreateIncomeSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
	});

	it('rejects a malformed date', () => {
		expect(apiCreateIncomeSchema.safeParse({ ...valid, date: '08/12/2026' }).success).toBe(false);
	});

	it('rejects an id field (server-generated)', () => {
		const result = apiCreateIncomeSchema.safeParse({ ...valid, id: 'client-supplied' });
		expect(result.success && !('id' in result.data)).toBe(true);
	});

	it('rejects a missing name', () => {
		expect(apiCreateIncomeSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
	});
});

describe('apiIncomeListQuerySchema', () => {
	it('accepts no filters', () => {
		expect(apiIncomeListQuerySchema.safeParse({}).success).toBe(true);
	});

	it('accepts a full date range', () => {
		expect(
			apiIncomeListQuerySchema.safeParse({ startDate: '2026-08-01', endDate: '2026-08-31' }).success
		).toBe(true);
	});

	it('rejects a one-sided date range', () => {
		expect(apiIncomeListQuerySchema.safeParse({ startDate: '2026-08-01' }).success).toBe(false);
	});

	it('accepts month and year together', () => {
		expect(apiIncomeListQuerySchema.safeParse({ month: 8, year: 2026 }).success).toBe(true);
	});

	it('rejects month without year', () => {
		expect(apiIncomeListQuerySchema.safeParse({ month: 8 }).success).toBe(false);
	});
});
