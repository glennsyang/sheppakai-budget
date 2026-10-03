import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn<() => Promise<unknown[]>>(async () => []),
	findFirst: vi.fn<() => Promise<undefined>>(async () => undefined),
	select: vi.fn<(fields: Record<string, unknown>) => unknown>(),
	where: vi.fn<(condition: unknown) => unknown>(),
	orderBy: vi.fn<(order: unknown) => Promise<unknown[]>>(async () => [])
}));

vi.mock('drizzle-orm', () => ({
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value }),
	inArray: (field: unknown, values: unknown) => ({ type: 'inArray', field, values }),
	desc: (field: unknown) => ({ type: 'desc', field })
}));

vi.mock('../index', () => ({
	getDb: () => ({
		select: (fields: Record<string, unknown>) => {
			mockState.select(fields);
			return {
				from: () => ({
					where: (condition: unknown) => {
						mockState.where(condition);
						return { orderBy: mockState.orderBy };
					}
				})
			};
		}
	})
}));

vi.mock('../schema', () => ({
	account: { userId: 'account.user_id' },
	session: {
		id: 'session.id',
		userId: 'session.user_id',
		token: 'session.token',
		createdAt: 'session.created_at',
		expiresAt: 'session.expires_at',
		ipAddress: 'session.ip_address',
		userAgent: 'session.user_agent',
		impersonatedBy: 'session.impersonated_by'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn<() => void>(),
		findFirst: mockState.findFirst
	})
}));

import { accountQueries, sessionQueries } from './users';

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

describe('sessionQueries.findSummariesByUserIds', () => {
	beforeEach(() => {
		mockState.select.mockClear();
		mockState.where.mockClear();
	});

	it('selects every listed user in one query and never selects the session token', async () => {
		await sessionQueries.findSummariesByUserIds(['u1', 'u2']);

		expect(mockState.select).toHaveBeenCalledOnce();
		const fields = mockState.select.mock.calls[0][0];
		expect(Object.values(fields)).not.toContain('session.token');
		expect(fields).toHaveProperty('userId', 'session.user_id');
		expect(mockState.where).toHaveBeenCalledWith({
			type: 'inArray',
			field: 'session.user_id',
			values: ['u1', 'u2']
		});
	});

	it('skips the query when there are no users', async () => {
		await expect(sessionQueries.findSummariesByUserIds([])).resolves.toEqual([]);
		expect(mockState.select).not.toHaveBeenCalled();
	});
});
