import { beforeEach, describe, expect, it, vi } from 'vitest';

type InsertedRow = {
	id: string;
	amount: number;
	payee: string;
	notes: string;
	date: string;
	gstAmount: undefined;
	excludedFromBudget: boolean;
	categoryId: string;
	userId: string;
	createdBy: string;
	updatedBy: string;
};
type FoundTransaction = { id: string; amount: number; category: null; user: object };

const mockInsertReturning = vi.hoisted(() =>
	vi.fn<() => Promise<InsertedRow[]>>(async () => [
		{
			id: 'txn-1',
			amount: 42.5,
			payee: 'Grocery Store',
			notes: 'Weekly shop',
			date: '2020-06-15 00:00:00',
			gstAmount: undefined,
			excludedFromBudget: false,
			categoryId: 'cat-1',
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
	vi.fn<(id: string) => Promise<FoundTransaction | undefined>>(async (id) => ({
		id,
		amount: 42.5,
		category: null,
		user: {}
	}))
);
const mockEvaluateBudgetAlert = vi.hoisted(() =>
	vi.fn<(row: InsertedRow) => Promise<void>>(async () => undefined)
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ insert: mockInsert }) }));
vi.mock('$lib/server/db/queries', () => ({ transactionQueries: { findById: mockFindById } }));
vi.mock('$lib/server/db/schema', () => ({ transaction: {} }));
vi.mock('$lib/server/notifications/budget-threshold-alerts', () => ({
	evaluateCreatedTransactionBudgetAlert: mockEvaluateBudgetAlert
}));

import { createTransaction } from './transactions';

describe('createTransaction', () => {
	beforeEach(() => {
		mockInsert.mockClear();
		mockInsertValues.mockClear();
		mockInsertReturning.mockClear();
		mockFindById.mockClear();
		mockEvaluateBudgetAlert.mockClear();
	});

	it('inserts with createdBy/updatedBy stamped to the acting user', async () => {
		await createTransaction(
			{
				amount: 42.5,
				payee: 'Grocery Store',
				notes: 'Weekly shop',
				date: '2020-06-15',
				excludedFromBudget: false,
				categoryId: 'cat-1'
			},
			'user-1'
		);

		const insertedValues = mockInsertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(insertedValues.userId).toBe('user-1');
		expect(insertedValues.createdBy).toBe('user-1');
		expect(insertedValues.updatedBy).toBe('user-1');
		expect(insertedValues.categoryId).toBe('cat-1');
		expect(String(insertedValues.date)).toMatch(/^2020-06-15 \d{2}:\d{2}:\d{2}$/);
	});

	it('evaluates budget alerts for the inserted row', async () => {
		await createTransaction(
			{
				amount: 42.5,
				payee: 'Grocery Store',
				notes: 'Weekly shop',
				date: '2020-06-15',
				excludedFromBudget: false,
				categoryId: 'cat-1'
			},
			'user-1'
		);

		expect(mockEvaluateBudgetAlert).toHaveBeenCalledWith(
			expect.objectContaining({ id: 'txn-1', categoryId: 'cat-1' })
		);
	});

	it('re-fetches the created record with relations', async () => {
		const result = await createTransaction(
			{
				amount: 42.5,
				payee: 'Grocery Store',
				notes: 'Weekly shop',
				date: '2020-06-15',
				excludedFromBudget: false,
				categoryId: 'cat-1'
			},
			'user-1'
		);

		expect(mockFindById).toHaveBeenCalledWith('txn-1');
		expect(result).toEqual({ id: 'txn-1', amount: 42.5, category: null, user: {} });
	});

	it('throws if the record cannot be re-fetched after insert', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		await expect(
			createTransaction(
				{
					amount: 42.5,
					payee: 'Grocery Store',
					notes: 'Weekly shop',
					date: '2020-06-15',
					excludedFromBudget: false,
					categoryId: 'cat-1'
				},
				'user-1'
			)
		).rejects.toThrow('Failed to re-fetch transaction txn-1 after creation');
	});
});
