import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	select: vi.fn<() => unknown>(),
	sendWeeklySummaryEmail: vi.fn<(payload: { to: string }) => Promise<unknown>>(),
	loggerInfo: vi.fn<() => void>(),
	loggerWarn: vi.fn<() => void>(),
	loggerError: vi.fn<() => void>()
}));

vi.mock('$lib/server/db', () => ({
	getDb: () => ({ select: mockState.select })
}));

vi.mock('$lib/server/email', () => ({
	sendWeeklySummaryEmail: mockState.sendWeeklySummaryEmail
}));

vi.mock('$lib/server/logger', () => ({
	logger: {
		debug: vi.fn<() => void>(),
		info: mockState.loggerInfo,
		warn: mockState.loggerWarn,
		error: mockState.loggerError
	}
}));

import { runWeeklySummaryEmail } from './weeklySummaryEmail';

// A query-builder stub matching the job's shapes:
// .from().where() and .from().innerJoin().where() — `where()` is always last.
function queryResult(rows: unknown[]) {
	const resolved = Promise.resolve(rows);
	return {
		from: () => ({
			where: () => resolved,
			innerJoin: () => ({ where: () => resolved })
		})
	};
}

const MONDAY_PACIFIC = new Date('2026-09-14T16:10:00Z'); // 9:10am PDT, Monday
const TUESDAY_PACIFIC = new Date('2026-09-15T16:10:00Z');

describe('runWeeklySummaryEmail', () => {
	beforeEach(() => {
		mockState.select.mockReset();
		mockState.sendWeeklySummaryEmail.mockReset();
		mockState.loggerInfo.mockReset();
		mockState.loggerWarn.mockReset();
		mockState.loggerError.mockReset();
		mockState.sendWeeklySummaryEmail.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('skips without touching the database when it is not Monday Pacific time', async () => {
		const result = await runWeeklySummaryEmail(TUESDAY_PACIFIC);

		expect(result.skipped).toBe(true);
		expect(result.reason).toBe('Not Monday Pacific time');
		expect(mockState.select).not.toHaveBeenCalled();
	});

	it('skips when no budgets exist for the current month', async () => {
		mockState.select
			.mockReturnValueOnce(queryResult([{ name: 'Glenn', email: 'glenn@example.com' }]))
			.mockReturnValueOnce(queryResult([]));

		const result = await runWeeklySummaryEmail(MONDAY_PACIFIC);

		expect(result.skipped).toBe(true);
		expect(result.reason).toBe('No budgets found for current month');
		expect(result.recipientsScanned).toBe(1);
		expect(mockState.sendWeeklySummaryEmail).not.toHaveBeenCalled();
	});

	it('classifies over-budget and near-limit categories and emails every recipient', async () => {
		mockState.select
			.mockReturnValueOnce(
				queryResult([
					{ name: 'Glenn', email: 'glenn@example.com' },
					{ name: 'Sam', email: 'sam@example.com' }
				])
			)
			.mockReturnValueOnce(
				queryResult([
					{ categoryId: 'cat-groceries', categoryName: 'Groceries', amount: 100 },
					{ categoryId: 'cat-fuel', categoryName: 'Fuel', amount: 50 },
					{ categoryId: 'cat-fun', categoryName: 'Fun', amount: 20 }
				])
			)
			.mockReturnValueOnce(
				queryResult([
					{ categoryId: 'cat-groceries', amount: 120 }, // over by 20
					{ categoryId: 'cat-fuel', amount: 48 }, // within 10% (>= 45)
					{ categoryId: 'cat-fun', amount: 5 } // well under threshold
				])
			);

		const result = await runWeeklySummaryEmail(MONDAY_PACIFIC);

		expect(result.skipped).toBe(false);
		expect(result.overBudgetCount).toBe(1);
		expect(result.nearLimitCount).toBe(1);
		expect(result.emailsSent).toBe(2);
		expect(result.emailsFailed).toBe(0);
		expect(mockState.sendWeeklySummaryEmail).toHaveBeenCalledTimes(2);

		const [firstCall] = mockState.sendWeeklySummaryEmail.mock.calls;
		expect(firstCall[0]).toMatchObject({
			to: 'glenn@example.com',
			overBudgetCategories: [
				expect.objectContaining({ categoryName: 'Groceries', overByAmount: 20 })
			],
			nearLimitCategories: [expect.objectContaining({ categoryName: 'Fuel' })]
		});
		expect(mockState.loggerInfo).toHaveBeenCalledWith(
			'Weekly summary email run completed',
			expect.objectContaining({ emailsFailed: 0 })
		);
		expect(mockState.loggerWarn).not.toHaveBeenCalled();
	});

	it('attributes a failed send to its recipient and logs the run as degraded', async () => {
		mockState.select
			.mockReturnValueOnce(
				queryResult([
					{ name: 'Glenn', email: 'glenn@example.com' },
					{ name: 'Sam', email: 'sam@example.com' }
				])
			)
			.mockReturnValueOnce(
				queryResult([{ categoryId: 'cat-groceries', categoryName: 'Groceries', amount: 100 }])
			)
			.mockReturnValueOnce(queryResult([]));

		const sendError = new Error('Brevo rejected the request');
		mockState.sendWeeklySummaryEmail
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(sendError);

		const result = await runWeeklySummaryEmail(MONDAY_PACIFIC);

		expect(result.emailsSent).toBe(1);
		expect(result.emailsFailed).toBe(1);
		expect(mockState.loggerError).toHaveBeenCalledWith(
			'Failed to send weekly summary email to recipient',
			sendError,
			{ email: 'sam@example.com' }
		);
		expect(mockState.loggerWarn).toHaveBeenCalledWith(
			'Weekly summary email run completed with failures',
			expect.objectContaining({ emailsFailed: 1, emailsSent: 1 })
		);
		expect(mockState.loggerInfo).not.toHaveBeenCalledWith(
			'Weekly summary email run completed',
			expect.anything()
		);
	});
});
