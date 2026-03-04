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
		gstAmount: 'transaction.gst_amount'
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
});
