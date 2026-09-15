import { beforeEach, describe, expect, it, vi } from 'vitest';

type FoundCustomer = { id: string; name: string } | undefined;

const mockInsertReturning = vi.hoisted(() =>
	vi.fn<() => Promise<{ id: string }[]>>(async () => [{ id: 'cust-1' }])
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
const mockUpdateWhere = vi.hoisted(() => vi.fn<() => Promise<void>>(async () => undefined));
const mockUpdateSet = vi.hoisted(() =>
	vi.fn<(values: Record<string, unknown>) => { where: typeof mockUpdateWhere }>((values) => {
		void values;
		return { where: mockUpdateWhere };
	})
);
const mockUpdate = vi.hoisted(() =>
	vi.fn<() => { set: typeof mockUpdateSet }>(() => ({ set: mockUpdateSet }))
);
const mockFindById = vi.hoisted(() =>
	vi.fn<(id: string) => Promise<FoundCustomer>>(async (id) => ({ id, name: 'Jane Doe' }))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ insert: mockInsert, update: mockUpdate }) }));
vi.mock('$lib/server/db/queries', () => ({
	windowCleaningCustomerQueries: { findById: mockFindById }
}));
vi.mock('$lib/server/db/schema', () => ({ windowCleaningCustomer: { id: 'wcc.id' } }));
vi.mock('drizzle-orm', () => ({ eq: (field: unknown, value: unknown) => ({ field, value }) }));

import {
	createWindowCleaningCustomer,
	updateWindowCleaningCustomer
} from './window-cleaning-customers';

const input = { name: 'Jane Doe', address: '123 Main St', city: 'Vancouver' };

describe('createWindowCleaningCustomer', () => {
	beforeEach(() => {
		mockInsert.mockClear();
		mockInsertValues.mockClear();
		mockInsertReturning.mockClear();
		mockFindById.mockClear();
	});

	it('inserts with createdBy/updatedBy stamped to the acting user', async () => {
		await createWindowCleaningCustomer(input, 'user-1');

		const insertedValues = mockInsertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(insertedValues.userId).toBe('user-1');
		expect(insertedValues.createdBy).toBe('user-1');
		expect(insertedValues.updatedBy).toBe('user-1');
		expect(insertedValues.unitNumber).toBeNull();
	});

	it('re-fetches the created record', async () => {
		const result = await createWindowCleaningCustomer(input, 'user-1');

		expect(mockFindById).toHaveBeenCalledWith('cust-1');
		expect(result).toEqual({ id: 'cust-1', name: 'Jane Doe' });
	});

	it('throws if the record cannot be re-fetched after insert', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		await expect(createWindowCleaningCustomer(input, 'user-1')).rejects.toThrow(
			'Failed to re-fetch window cleaning customer cust-1 after creation'
		);
	});
});

describe('updateWindowCleaningCustomer', () => {
	beforeEach(() => {
		mockUpdate.mockClear();
		mockUpdateSet.mockClear();
		mockUpdateWhere.mockClear();
		mockFindById.mockClear();
	});

	it('sets fields with updatedBy/updatedAt stamped to the acting user', async () => {
		await updateWindowCleaningCustomer('cust-1', input, 'user-1');

		const setValues = mockUpdateSet.mock.calls[0][0] as Record<string, unknown>;
		expect(setValues.name).toBe('Jane Doe');
		expect(setValues.updatedBy).toBe('user-1');
		expect(typeof setValues.updatedAt).toBe('string');
	});

	it('re-fetches the updated record', async () => {
		const result = await updateWindowCleaningCustomer('cust-1', input, 'user-1');

		expect(mockFindById).toHaveBeenCalledWith('cust-1');
		expect(result).toEqual({ id: 'cust-1', name: 'Jane Doe' });
	});

	it('returns undefined when the record does not exist', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		const result = await updateWindowCleaningCustomer('missing', input, 'user-1');

		expect(result).toBeUndefined();
	});
});
