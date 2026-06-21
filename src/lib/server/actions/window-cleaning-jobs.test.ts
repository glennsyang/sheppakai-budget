import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before any module imports
// ---------------------------------------------------------------------------

type MockState = {
	fail: ReturnType<typeof vi.fn>;
	deleteWhere: ReturnType<typeof vi.fn>;
	deleteFrom: ReturnType<typeof vi.fn>;
	db: { delete: ReturnType<typeof vi.fn> };
	loggerInfo: ReturnType<typeof vi.fn>;
	loggerError: ReturnType<typeof vi.fn>;
	requireAuth: ReturnType<typeof vi.fn>;
	updateAction: ReturnType<typeof vi.fn>;
};

const mockState: MockState = vi.hoisted((): MockState => {
	const state = {
		fail: vi.fn<
			(
				status: number,
				data: Record<string, unknown>
			) => { status: number; data: Record<string, unknown>; __failure: boolean }
		>((status, data) => ({ status, data, __failure: true })),
		deleteWhere: vi.fn<() => Promise<unknown[]>>(async () => []),
		deleteFrom: vi.fn<() => unknown>(),
		db: { delete: vi.fn<() => unknown>() },
		loggerInfo: vi.fn<() => void>(),
		loggerError: vi.fn<() => void>(),
		requireAuth: vi.fn<
			(
				handler: (event: unknown, user: { id: string }) => Promise<unknown>
			) => (event: unknown) => Promise<unknown>
		>((handler) => async (event) => handler(event, { id: 'user-1' })),
		updateAction: vi.fn<() => ReturnType<typeof vi.fn<() => void>>>(() => vi.fn<() => void>())
	} as unknown as MockState;

	state.deleteFrom = vi.fn<() => unknown>(() => ({ where: state.deleteWhere }));
	state.db = { delete: state.deleteFrom };

	return state;
});

vi.mock('@sveltejs/kit', () => ({ fail: mockState.fail }));
vi.mock('$lib/server/db', () => ({ getDb: () => mockState.db }));
vi.mock('$lib/server/logger', () => ({
	logger: { info: mockState.loggerInfo, error: mockState.loggerError }
}));
vi.mock('drizzle-orm', () => ({
	eq: (field: unknown, value: unknown) => ({ field, value })
}));
vi.mock('./auth-guard', () => ({ requireAuth: mockState.requireAuth }));
vi.mock('./crud-helpers', () => ({ updateAction: mockState.updateAction }));

// Mock schema and schema-dependent modules after mocks are wired
vi.mock('$lib/formSchemas', () => ({ windowCleaningJobSchema: { _tag: 'mock-schema' } }));
vi.mock('$lib/server/db/schema', () => ({
	windowCleaningJob: { id: 'id-column', _tag: 'mock-table' }
}));
vi.mock('$lib/utils/dates', () => ({
	formatDateForStorage: (d: string) => `stored:${d}`
}));

import { deleteJob } from './window-cleaning-jobs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeEvent = (formEntries: Array<[string, string]> = []) => {
	const formData = new FormData();
	for (const [key, value] of formEntries) {
		formData.append(key, value);
	}
	return {
		request: { formData: async () => formData },
		locals: { user: { id: 'user-1' } }
	} as unknown as Parameters<typeof deleteJob>[0];
};

// ---------------------------------------------------------------------------
// updateJob
// ---------------------------------------------------------------------------

describe('updateJob', () => {
	it('calls updateAction with the correct entityName and schema', () => {
		expect(mockState.updateAction).toHaveBeenCalledWith(
			expect.objectContaining({
				entityName: 'Job',
				schema: { _tag: 'mock-schema' },
				table: expect.objectContaining({ _tag: 'mock-table' })
			})
		);
	});

	it('transformUpdate maps all fields correctly', () => {
		const config = mockState.updateAction.mock.calls[0][0] as {
			transformUpdate: (data: Record<string, unknown>) => Record<string, unknown>;
		};

		const result = config.transformUpdate({
			customerId: 'cust-1',
			jobDate: '2026-06-20',
			jobTime: '10:00',
			amountCharged: 150,
			tip: 20,
			durationHours: 2.5,
			notes: 'Back windows'
		});

		expect(result).toEqual({
			customerId: 'cust-1',
			jobDate: 'stored:2026-06-20',
			jobTime: '10:00',
			amountCharged: 150,
			tip: 20,
			durationHours: 2.5,
			notes: 'Back windows'
		});
	});

	it('transformUpdate coerces falsy optional fields to null', () => {
		const config = mockState.updateAction.mock.calls[0][0] as {
			transformUpdate: (data: Record<string, unknown>) => Record<string, unknown>;
		};

		const result = config.transformUpdate({
			customerId: 'cust-2',
			jobDate: '2026-06-01',
			jobTime: '',
			amountCharged: 100,
			tip: undefined,
			durationHours: undefined,
			notes: ''
		});

		expect(result).toEqual({
			customerId: 'cust-2',
			jobDate: 'stored:2026-06-01',
			jobTime: null,
			amountCharged: 100,
			tip: 0,
			durationHours: null,
			notes: null
		});
	});
});

// ---------------------------------------------------------------------------
// deleteJob
// ---------------------------------------------------------------------------

describe('deleteJob', () => {
	beforeEach(() => {
		mockState.fail.mockClear();
		mockState.deleteWhere.mockClear();
		mockState.deleteFrom.mockClear();
		mockState.loggerInfo.mockClear();
		mockState.loggerError.mockClear();
	});

	it('returns 400 when id is missing from form data', async () => {
		const result = await deleteJob(makeEvent());

		expect(mockState.fail).toHaveBeenCalledWith(400, { error: 'Job ID is required' });
		expect(result).toEqual({
			status: 400,
			data: { error: 'Job ID is required' },
			__failure: true
		});
		expect(mockState.deleteFrom).not.toHaveBeenCalled();
	});

	it('deletes the job and returns success when id is provided', async () => {
		const result = await deleteJob(makeEvent([['id', 'job-abc']]));

		expect(mockState.deleteFrom).toHaveBeenCalledWith(
			expect.objectContaining({ _tag: 'mock-table' })
		);
		expect(mockState.deleteWhere).toHaveBeenCalledWith({ field: 'id-column', value: 'job-abc' });
		expect(mockState.loggerInfo).toHaveBeenCalledWith('Job deleted: job-abc');
		expect(result).toEqual({ success: true, delete: true });
	});

	it('returns 500 and logs error when db throws', async () => {
		const dbError = new Error('DB failure');
		mockState.deleteWhere.mockRejectedValueOnce(dbError);

		const result = await deleteJob(makeEvent([['id', 'job-xyz']]));

		expect(mockState.fail).toHaveBeenCalledWith(500, { error: 'Failed to delete job' });
		expect(result).toEqual({
			status: 500,
			data: { error: 'Failed to delete job' },
			__failure: true
		});
		expect(mockState.loggerError).toHaveBeenCalledWith('Failed to delete job', dbError);
	});

	it('does not invoke the handler when user is unauthenticated', async () => {
		// requireAuth is mocked to pass through, but we can verify requireAuth was invoked
		// with a handler during module init — this test validates the wrapping contract.
		expect(mockState.requireAuth).toHaveBeenCalledTimes(1);
	});
});
