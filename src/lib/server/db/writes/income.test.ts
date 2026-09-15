import { beforeEach, describe, expect, it, vi } from 'vitest';

type InsertedRow = {
	id: string;
	name: string;
	description: string;
	date: string;
	amount: number;
	userId: string;
	createdBy: string;
	updatedBy: string;
};
type FoundIncome = { id: string; amount: number; user: object };

const mockInsertReturning = vi.hoisted(() =>
	vi.fn<() => Promise<InsertedRow[]>>(async () => [
		{
			id: 'income-1',
			name: 'Freelance payment',
			description: 'Invoice #42',
			date: '2026-08-12 00:00:00',
			amount: 500,
			userId: 'user-1',
			createdBy: 'user-1',
			updatedBy: 'user-1'
		}
	])
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
	vi.fn<(id: string) => Promise<FoundIncome | undefined>>(async (id) => ({
		id,
		amount: 500,
		user: {}
	}))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ insert: mockInsert }) }));
vi.mock('$lib/server/db/queries', () => ({ incomeQueries: { findById: mockFindById } }));
vi.mock('$lib/server/db/schema', () => ({ income: {} }));

import { createIncome } from './income';

describe('createIncome', () => {
	beforeEach(() => {
		mockInsert.mockClear();
		mockInsertValues.mockClear();
		mockInsertReturning.mockClear();
		mockFindById.mockClear();
	});

	it('inserts with createdBy/updatedBy stamped to the acting user', async () => {
		await createIncome(
			{ name: 'Freelance payment', description: 'Invoice #42', date: '2026-08-12', amount: 500 },
			'user-1'
		);

		const insertedValues = mockInsertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(insertedValues.userId).toBe('user-1');
		expect(insertedValues.createdBy).toBe('user-1');
		expect(insertedValues.updatedBy).toBe('user-1');
		expect(String(insertedValues.date)).toMatch(/^2026-08-12 \d{2}:\d{2}:\d{2}$/);
	});

	it('re-fetches the created record with relations', async () => {
		const result = await createIncome(
			{ name: 'Freelance payment', description: 'Invoice #42', date: '2026-08-12', amount: 500 },
			'user-1'
		);

		expect(mockFindById).toHaveBeenCalledWith('income-1');
		expect(result).toEqual({ id: 'income-1', amount: 500, user: {} });
	});

	it('throws if the record cannot be re-fetched after insert', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		await expect(
			createIncome(
				{ name: 'Freelance payment', description: 'Invoice #42', date: '2026-08-12', amount: 500 },
				'user-1'
			)
		).rejects.toThrow('Failed to re-fetch income income-1 after creation');
	});
});
