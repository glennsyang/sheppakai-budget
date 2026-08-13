import { describe, expect, it } from 'vitest';

import { apiCreateTransactionSchema, apiTransactionListQuerySchema } from './transactions';

describe('apiCreateTransactionSchema', () => {
	const valid = {
		amount: 42.5,
		payee: 'Grocery Store',
		notes: 'Weekly shop',
		date: '2026-08-12',
		categoryId: 'cat-1'
	};

	it('accepts a valid body', () => {
		expect(apiCreateTransactionSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a non-positive amount', () => {
		expect(apiCreateTransactionSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false);
	});

	it('rejects a malformed date', () => {
		expect(apiCreateTransactionSchema.safeParse({ ...valid, date: '08/12/2026' }).success).toBe(
			false
		);
	});

	it('rejects an id field (server-generated)', () => {
		const result = apiCreateTransactionSchema.safeParse({ ...valid, id: 'client-supplied' });
		expect(result.success && !('id' in result.data)).toBe(true);
	});

	it('rejects a missing category', () => {
		expect(apiCreateTransactionSchema.safeParse({ ...valid, categoryId: '' }).success).toBe(false);
	});
});

describe('apiTransactionListQuerySchema', () => {
	it('accepts no filters', () => {
		expect(apiTransactionListQuerySchema.safeParse({}).success).toBe(true);
	});

	it('accepts a full date range', () => {
		expect(
			apiTransactionListQuerySchema.safeParse({ startDate: '2026-08-01', endDate: '2026-08-31' })
				.success
		).toBe(true);
	});

	it('rejects a one-sided date range', () => {
		expect(apiTransactionListQuerySchema.safeParse({ startDate: '2026-08-01' }).success).toBe(
			false
		);
	});

	it('rejects a malformed date', () => {
		expect(
			apiTransactionListQuerySchema.safeParse({ startDate: '08-01-2026', endDate: '2026-08-31' })
				.success
		).toBe(false);
	});
});
