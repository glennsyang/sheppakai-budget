import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn(async (_options?: { where?: unknown }) => []),
	createdBuilder: null as unknown,
	findByDateRangeSpy: null as unknown
}));

vi.mock('drizzle-orm', () => ({
	and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value }),
	isNotNull: (field: unknown) => ({ type: 'isNotNull', field }),
	ne: (field: unknown, value: unknown) => ({ type: 'ne', field, value }),
	or: (...conditions: unknown[]) => ({ type: 'or', conditions }),
	sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
		type: 'sql',
		text: strings.join('?'),
		values
	})
}));

vi.mock('../schema', () => ({
	transaction: {
		date: 'transaction.date',
		categoryId: 'transaction.category_id',
		gstAmount: 'transaction.gst_amount',
		payee: 'transaction.payee',
		notes: 'transaction.notes'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => {
		const builder = {
			findAll: mockState.findAll,
			findById: vi.fn(),
			findFirst: vi.fn()
		};
		mockState.createdBuilder = builder;
		return builder;
	}
}));

import { transactionQueries } from './transactions';

describe('transactionQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockClear();
		mockState.findAll.mockResolvedValue([]);
	});

	it('findByMonth calculates month boundaries and delegates to findByDateRange', async () => {
		const spy = vi.spyOn(transactionQueries, 'findByDateRange').mockResolvedValue([]);

		await transactionQueries.findByMonth(2, 2024);

		expect(spy).toHaveBeenCalledWith('2024-02-01', '2024-02-29');
		spy.mockRestore();
	});

	it('findByCategory without range filters by category only', async () => {
		await transactionQueries.findByCategory('cat-1');

		expect(mockState.findAll).toHaveBeenCalledWith({
			where: {
				type: 'eq',
				field: 'transaction.category_id',
				value: 'cat-1'
			}
		});
	});

	it('findByCategory with range builds compound condition', async () => {
		await transactionQueries.findByCategory('cat-2', {
			start: '2026-01-01',
			end: '2026-01-31'
		});

		const call = mockState.findAll.mock.lastCall;
		expect(call).toBeDefined();
		const arg = call?.[0] as unknown as { where: { type: string; conditions: unknown[] } };
		expect(arg.where.type).toBe('and');
		expect(arg.where.conditions).toHaveLength(3);
	});

	it('findByDateRangeExcludingCategory adds gst constraints when required', async () => {
		await transactionQueries.findByDateRangeExcludingCategory(
			'2026-01-01',
			'2026-01-31',
			'business',
			true
		);

		const call = mockState.findAll.mock.lastCall;
		expect(call).toBeDefined();
		const arg = call?.[0] as unknown as { where: { conditions: unknown[] } };
		expect(arg.where.conditions).toHaveLength(5);
	});

	it('findByDateRangeExcludingCategory omits gst constraints by default', async () => {
		await transactionQueries.findByDateRangeExcludingCategory(
			'2026-01-01',
			'2026-01-31',
			'business'
		);

		const call = mockState.findAll.mock.lastCall;
		expect(call).toBeDefined();
		const arg = call?.[0] as unknown as { where: { conditions: unknown[] } };
		expect(arg.where.conditions).toHaveLength(3);
	});

	describe('search', () => {
		type SqlCondition = { type: string; text: string; values: unknown[] };
		type OrWhere = { type: string; conditions: SqlCondition[] };

		function getWhere() {
			const call = mockState.findAll.mock.lastCall;
			expect(call).toBeDefined();
			return (call![0] as unknown as { where: OrWhere }).where;
		}

		it('builds an OR condition spanning payee and notes columns', async () => {
			await transactionQueries.search('coffee');

			const where = getWhere();
			expect(where.type).toBe('or');
			expect(where.conditions).toHaveLength(2);
		});

		it('targets the payee column first and notes column second', async () => {
			await transactionQueries.search('coffee');

			const where = getWhere();
			expect(where.conditions[0].values[0]).toBe('transaction.payee');
			expect(where.conditions[1].values[0]).toBe('transaction.notes');
		});

		it('wraps the search term in % wildcards for a contains match', async () => {
			await transactionQueries.search('coffee');

			const where = getWhere();
			expect(where.conditions[0].values[1]).toBe('%coffee%');
			expect(where.conditions[1].values[1]).toBe('%coffee%');
		});

		it('includes an ESCAPE clause in both SQL conditions', async () => {
			await transactionQueries.search('coffee');

			const where = getWhere();
			for (const condition of where.conditions) {
				expect(condition.type).toBe('sql');
				expect(condition.text).toContain('ESCAPE');
			}
		});

		it('escapes % to prevent wildcard injection', async () => {
			await transactionQueries.search('100%off');

			const where = getWhere();
			expect(where.conditions[0].values[1]).toBe('%100\\%off%');
			expect(where.conditions[1].values[1]).toBe('%100\\%off%');
		});

		it('escapes _ to prevent single-character wildcard injection', async () => {
			await transactionQueries.search('a_b');

			const where = getWhere();
			expect(where.conditions[0].values[1]).toBe('%a\\_b%');
			expect(where.conditions[1].values[1]).toBe('%a\\_b%');
		});

		it('escapes backslashes to prevent corruption of the LIKE escape sequence', async () => {
			await transactionQueries.search('a\\b');

			const where = getWhere();
			expect(where.conditions[0].values[1]).toBe('%a\\\\b%');
			expect(where.conditions[1].values[1]).toBe('%a\\\\b%');
		});

		it('handles all three special characters in a single query', async () => {
			await transactionQueries.search('50%_off\\deal');

			const where = getWhere();
			expect(where.conditions[0].values[1]).toBe('%50\\%\\_off\\\\deal%');
			expect(where.conditions[1].values[1]).toBe('%50\\%\\_off\\\\deal%');
		});
	});
});
