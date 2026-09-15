import { beforeEach, describe, expect, it, vi } from 'vitest';

type FoundContribution = { id: string; amount: number; goal: object } | undefined;

const mockInsertReturning = vi.hoisted(() =>
	vi.fn<() => Promise<{ id: string }[]>>(async () => [{ id: 'contrib-1' }])
);
const mockInsertValues = vi.hoisted(() =>
	vi.fn<(values: Record<string, unknown>) => { returning: typeof mockInsertReturning }>(
		(values) => {
			void values;
			return { returning: mockInsertReturning };
		}
	)
);
const mockInsert = vi.hoisted(() =>
	vi.fn<() => { values: typeof mockInsertValues }>(() => ({ values: mockInsertValues }))
);
const mockFindById = vi.hoisted(() =>
	vi.fn<(id: string) => Promise<FoundContribution>>(async (id) => ({
		id,
		amount: 100,
		goal: {}
	}))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ insert: mockInsert }) }));
vi.mock('$lib/server/db/queries', () => ({ contributionQueries: { findById: mockFindById } }));
vi.mock('$lib/server/db/schema', () => ({ contribution: {} }));

import { createContribution } from './contributions';

const input = { amount: 100, date: '2026-08-12', description: 'Monthly deposit' };

describe('createContribution', () => {
	beforeEach(() => {
		mockInsert.mockClear();
		mockInsertValues.mockClear();
		mockInsertReturning.mockClear();
		mockFindById.mockClear();
	});

	it('inserts with the goalId from the path param and stamped audit fields', async () => {
		await createContribution('goal-1', input, 'user-1');

		const insertedValues = mockInsertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(insertedValues.goalId).toBe('goal-1');
		expect(insertedValues.userId).toBe('user-1');
		expect(insertedValues.createdBy).toBe('user-1');
		expect(insertedValues.updatedBy).toBe('user-1');
		expect(String(insertedValues.date)).toMatch(/^2026-08-12 \d{2}:\d{2}:\d{2}$/);
	});

	it('re-fetches the created record with relations', async () => {
		const result = await createContribution('goal-1', input, 'user-1');

		expect(mockFindById).toHaveBeenCalledWith('contrib-1');
		expect(result).toEqual({ id: 'contrib-1', amount: 100, goal: {} });
	});

	it('throws if the record cannot be re-fetched after insert', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		await expect(createContribution('goal-1', input, 'user-1')).rejects.toThrow(
			'Failed to re-fetch contribution contrib-1 after creation'
		);
	});
});
