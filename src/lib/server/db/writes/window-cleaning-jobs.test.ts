import { beforeEach, describe, expect, it, vi } from 'vitest';

type FoundJob = { id: string; amountCharged: number; customer: object } | undefined;

const mockInsertReturning = vi.hoisted(() =>
	vi.fn<() => Promise<{ id: string }[]>>(async () => [{ id: 'job-1' }])
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
	vi.fn<(id: string) => Promise<FoundJob>>(async (id) => ({
		id,
		amountCharged: 120,
		customer: {}
	}))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ insert: mockInsert }) }));
vi.mock('$lib/server/db/queries', () => ({
	windowCleaningJobQueries: { findById: mockFindById }
}));
vi.mock('$lib/server/db/schema', () => ({ windowCleaningJob: {} }));

import { createWindowCleaningJob } from './window-cleaning-jobs';

const input = { customerId: 'cust-1', jobDate: '2026-08-12', amountCharged: 120, tip: 20 };

describe('createWindowCleaningJob', () => {
	beforeEach(() => {
		mockInsert.mockClear();
		mockInsertValues.mockClear();
		mockInsertReturning.mockClear();
		mockFindById.mockClear();
	});

	it('inserts with createdBy/updatedBy stamped to the acting user', async () => {
		await createWindowCleaningJob(input, 'user-1');

		const insertedValues = mockInsertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(insertedValues.userId).toBe('user-1');
		expect(insertedValues.createdBy).toBe('user-1');
		expect(insertedValues.updatedBy).toBe('user-1');
		expect(insertedValues.customerId).toBe('cust-1');
		expect(String(insertedValues.jobDate)).toMatch(/^2026-08-12 \d{2}:\d{2}:\d{2}$/);
	});

	it('re-fetches the created record with relations', async () => {
		const result = await createWindowCleaningJob(input, 'user-1');

		expect(mockFindById).toHaveBeenCalledWith('job-1');
		expect(result).toEqual({ id: 'job-1', amountCharged: 120, customer: {} });
	});

	it('throws if the record cannot be re-fetched after insert', async () => {
		mockFindById.mockResolvedValueOnce(undefined);

		await expect(createWindowCleaningJob(input, 'user-1')).rejects.toThrow(
			'Failed to re-fetch window cleaning job job-1 after creation'
		);
	});
});
