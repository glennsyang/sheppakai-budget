import { describe, expect, it, vi } from 'vitest';

const mockFindAll = vi.hoisted(() =>
	vi.fn<(_options?: { where?: unknown; with?: unknown }) => Promise<unknown[]>>(async () => [])
);

vi.mock('drizzle-orm', () => ({
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value })
}));

vi.mock('../schema', () => ({
	contribution: { date: 'contribution.date', goalId: 'contribution.goal_id' }
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockFindAll,
		findById: vi.fn<() => void>(),
		findFirst: vi.fn<() => void>()
	})
}));

import { contributionQueries } from './contributions';

describe('contributionQueries.findByGoalId', () => {
	it('filters by goal id without loading relations', async () => {
		await contributionQueries.findByGoalId('goal-1');

		expect(mockFindAll).toHaveBeenCalledWith({
			where: { type: 'eq', field: 'contribution.goal_id', value: 'goal-1' },
			with: {}
		});
	});
});
