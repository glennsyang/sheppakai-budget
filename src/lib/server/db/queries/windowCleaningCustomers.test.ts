import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn(async (_options?: { where?: unknown }) => []),
	findFirst: vi.fn(async (_options?: { where?: unknown }) => undefined),
	findManyDirect: vi.fn(async () => []),
	getDb: vi.fn()
}));

vi.mock('drizzle-orm', () => ({
	and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value }),
	isNull: (field: unknown) => ({ type: 'isNull', field }),
	isNotNull: (field: unknown) => ({ type: 'isNotNull', field })
}));

vi.mock('../schema', () => ({
	windowCleaningCustomer: {
		name: 'wc_customer.name',
		deletedAt: 'wc_customer.deleted_at',
		id: 'wc_customer.id'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn(),
		findFirst: mockState.findFirst
	})
}));

vi.mock('../index', () => ({
	getDb: mockState.getDb
}));

import { windowCleaningCustomerQueries } from './windowCleaningCustomers';

describe('windowCleaningCustomerQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findAll.mockResolvedValue([]);
		mockState.findFirst.mockReset();
		mockState.findFirst.mockResolvedValue(undefined);
		mockState.findManyDirect.mockReset();
		mockState.findManyDirect.mockResolvedValue([]);
		mockState.getDb.mockReset();
		mockState.getDb.mockReturnValue({
			query: {
				windowCleaningCustomer: {
					findMany: mockState.findManyDirect
				}
			}
		});
	});

	describe('findAll', () => {
		it('filters only by isNull(deletedAt)', async () => {
			await windowCleaningCustomerQueries.findAll();

			const arg = mockState.findAll.mock.lastCall![0] as unknown as {
				where: { type: string; field: string };
			};
			expect(arg.where.type).toBe('isNull');
			expect(arg.where.field).toBe('wc_customer.deleted_at');
		});
	});

	describe('findDeleted', () => {
		it('queries directly via getDb with isNotNull(deletedAt)', async () => {
			await windowCleaningCustomerQueries.findDeleted();

			expect(mockState.getDb).toHaveBeenCalled();
			expect(mockState.findManyDirect).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { type: 'isNotNull', field: 'wc_customer.deleted_at' }
				})
			);
		});

		it('requests the user relation', async () => {
			await windowCleaningCustomerQueries.findDeleted();

			expect(mockState.findManyDirect).toHaveBeenCalledWith(
				expect.objectContaining({ with: { user: true } })
			);
		});
	});

	describe('findById', () => {
		it('calls findFirst with id and isNull(deletedAt) conditions', async () => {
			await windowCleaningCustomerQueries.findById('cust-1');

			expect(mockState.findFirst).toHaveBeenCalledWith({
				where: expect.objectContaining({ type: 'and' })
			});

			const arg = mockState.findFirst.mock.lastCall![0] as unknown as {
				where: { type: string; conditions: unknown[] };
			};
			expect(arg.where.conditions).toHaveLength(2);
		});
	});
});
