import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be defined before any module imports
// ---------------------------------------------------------------------------

type MockState = {
	updateAction: ReturnType<typeof vi.fn>;
	deleteAction: ReturnType<typeof vi.fn>;
};

const mockState: MockState = vi.hoisted((): MockState => {
	return {
		updateAction: vi.fn<() => ReturnType<typeof vi.fn<() => void>>>(() => vi.fn<() => void>()),
		deleteAction: vi.fn<() => ReturnType<typeof vi.fn<() => void>>>(() => vi.fn<() => void>())
	} as unknown as MockState;
});

vi.mock('./crud-helpers', () => ({
	updateAction: mockState.updateAction,
	deleteAction: mockState.deleteAction
}));

// Mock schema and schema-dependent modules after mocks are wired
vi.mock('$lib/formSchemas', () => ({ windowCleaningJobSchema: { _tag: 'mock-schema' } }));
vi.mock('$lib/server/db/schema', () => ({
	windowCleaningJob: { id: 'id-column', _tag: 'mock-table' }
}));
vi.mock('$lib/utils/dates', () => ({
	formatDateForStorage: (d: string) => `stored:${d}`
}));

import './window-cleaning-jobs';

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
	// deleteJob is now nothing but a deleteAction, so all this file owes is the wiring —
	// validation, the delete itself, and the response contract are covered in crud-helpers.test.ts.
	it('delegates to deleteAction with the correct table and entityName', () => {
		expect(mockState.deleteAction).toHaveBeenCalledWith({
			entityName: 'Job',
			table: expect.objectContaining({ _tag: 'mock-table' })
		});
	});
});
