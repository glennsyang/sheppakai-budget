import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn<() => Promise<unknown[]>>(async () => []),
	findFirst: vi.fn<() => Promise<undefined>>(async () => undefined)
}));

vi.mock('drizzle-orm', () => ({
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value })
}));

vi.mock('../schema', () => ({
	user: { id: 'user.id' },
	account: { userId: 'account.user_id' }
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn<() => void>(),
		findFirst: mockState.findFirst
	})
}));

import { accountQueries, userQueries } from './users';

describe('userQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findFirst.mockReset();
		mockState.findFirst.mockResolvedValue(undefined);
	});

	describe('findWithRelations', () => {
		it('calls findFirst with eq(user.id) where condition', async () => {
			await userQueries.findWithRelations('u-1');

			expect(mockState.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { type: 'eq', field: 'user.id', value: 'u-1' }
				})
			);
		});

		it('requests accounts and sessions relations', async () => {
			await userQueries.findWithRelations('u-1');

			expect(mockState.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					with: { accounts: true, sessions: true }
				})
			);
		});
	});
});

describe('accountQueries', () => {
	beforeEach(() => {
		mockState.findFirst.mockReset();
		mockState.findFirst.mockResolvedValue(undefined);
	});

	describe('findByUserId', () => {
		it('calls findFirst with eq(account.userId) condition', async () => {
			await accountQueries.findByUserId('user-99');

			expect(mockState.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { type: 'eq', field: 'account.user_id', value: 'user-99' }
				})
			);
		});
	});
});
