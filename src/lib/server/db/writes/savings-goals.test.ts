import { describe, expect, it, vi } from 'vitest';

const mockUpdateWhere = vi.hoisted(() =>
	vi.fn<(where: unknown) => Promise<void>>(async () => undefined)
);
const mockUpdateSet = vi.hoisted(() =>
	vi.fn<(values: Record<string, unknown>) => { where: typeof mockUpdateWhere }>((values) => {
		void values;
		return { where: mockUpdateWhere };
	})
);
const mockUpdate = vi.hoisted(() =>
	vi.fn<(table: unknown) => { set: typeof mockUpdateSet }>(() => ({ set: mockUpdateSet }))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ update: mockUpdate }) }));
vi.mock('drizzle-orm', () => ({ eq: (field: unknown, value: unknown) => ({ field, value }) }));
vi.mock('$lib/server/db/schema', () => ({ savingsGoal: { id: 'savingsGoal.id' } }));

import { unarchiveSavingsGoal } from './savings-goals';

describe('unarchiveSavingsGoal', () => {
	it('sets the goal active with audit fields, scoped to the goal id', async () => {
		await unarchiveSavingsGoal('goal-1', 'user-1');

		const setValues = mockUpdateSet.mock.calls[0][0];
		expect(setValues.status).toBe('active');
		expect(setValues.updatedBy).toBe('user-1');
		expect(typeof setValues.updatedAt).toBe('string');
		expect(mockUpdateWhere).toHaveBeenCalledWith({ field: 'savingsGoal.id', value: 'goal-1' });
	});
});
