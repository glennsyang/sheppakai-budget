import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn<(_options?: { where?: unknown }) => Promise<unknown[]>>(
		async (_options?: { where?: unknown }) => []
	)
}));

vi.mock('drizzle-orm', () => ({
	asc: (field: unknown) => ({ type: 'asc', field }),
	ne: (field: unknown, value: unknown) => ({ type: 'ne', field, value })
}));

vi.mock('../schema', () => ({
	savingsGoal: {
		name: 'savingsGoal.name',
		status: 'savingsGoal.status'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn<() => void>(),
		findFirst: vi.fn<() => void>()
	})
}));

import { savingsGoalQueries } from './savings-goals';

describe('savingsGoalQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findAll.mockResolvedValue([]);
	});

	describe('findAll override', () => {
		it('always passes a ne(status, archived) where clause', async () => {
			await savingsGoalQueries.findAll();

			expect(mockState.findAll).toHaveBeenCalledWith({
				where: { type: 'ne', field: 'savingsGoal.status', value: 'archived' }
			});
		});

		it('uses the archived-filter even when options are not provided', async () => {
			await savingsGoalQueries.findAll();

			const arg = mockState.findAll.mock.lastCall![0] as unknown as {
				where: { type: string; value: string };
			};
			expect(arg.where.type).toBe('ne');
			expect(arg.where.value).toBe('archived');
		});
	});
});
