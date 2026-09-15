import { beforeEach, describe, expect, it, vi } from 'vitest';

type FoundRecurring = { id: string; paid: boolean } | undefined;

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
	vi.fn<(id: string) => Promise<FoundRecurring>>(async (id) => ({ id, paid: true }))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ update: mockUpdate }) }));
vi.mock('$lib/server/db/queries', () => ({ recurringQueries: { findById: mockFindById } }));
vi.mock('$lib/server/db/schema', () => ({ recurring: { id: 'recurring.id' } }));
vi.mock('drizzle-orm', () => ({ eq: (field: unknown, value: unknown) => ({ field, value }) }));

import { markRecurringPaid } from './recurring';

describe('markRecurringPaid', () => {
	beforeEach(() => {
		mockUpdate.mockClear();
		mockUpdateSet.mockClear();
		mockUpdateWhere.mockClear();
		mockFindById.mockClear();
	});

	it('sets paid, updatedBy, and updatedAt', async () => {
		await markRecurringPaid('rec-1', true, 'user-1');

		const setValues = mockUpdateSet.mock.calls[0][0] as Record<string, unknown>;
		expect(setValues.paid).toBe(true);
		expect(setValues.updatedBy).toBe('user-1');
		expect(typeof setValues.updatedAt).toBe('string');
	});

	it('re-fetches the updated record', async () => {
		const result = await markRecurringPaid('rec-1', false, 'user-1');

		expect(mockFindById).toHaveBeenCalledWith('rec-1');
		expect(result).toEqual({ id: 'rec-1', paid: true });
	});

	it('returns undefined when the record does not exist', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		const result = await markRecurringPaid('missing', true, 'user-1');

		expect(result).toBeUndefined();
	});
});
