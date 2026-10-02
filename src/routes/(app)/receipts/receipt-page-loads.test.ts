import { error, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findByCategory: vi.fn<() => Promise<unknown[]>>(),
	findByDateRangeExcludingCategory: vi.fn<() => Promise<unknown[]>>(),
	loggerError: vi.fn<() => void>()
}));

vi.mock('$lib/server/db/queries', () => ({
	transactionQueries: {
		findByCategory: mockState.findByCategory,
		findByDateRangeExcludingCategory: mockState.findByDateRangeExcludingCategory
	}
}));

vi.mock('$lib/server/logger', () => ({
	logger: {
		debug: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		error: mockState.loggerError
	}
}));

import { load as businessLoad } from './business/+page.server';
import { load as fuelLoad } from './fuel/+page.server';

const loads = { business: businessLoad, fuel: fuelLoad };

const GAS = { id: 'gas-category-id', name: 'Gas' };
const URL_ = new URL('https://budget.example.com/receipts?month=3&year=2026');

function event(parent: () => Promise<unknown>) {
	return { url: URL_, parent, request: new Request(URL_), route: { id: null } } as never;
}

async function rejection(promise: unknown): Promise<unknown> {
	try {
		await promise;
	} catch (caught) {
		return caught;
	}
	throw new Error('Expected load to reject');
}

describe.each(Object.entries(loads))('receipts/%s load', (_name, load) => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockState.findByCategory.mockResolvedValue([]);
		mockState.findByDateRangeExcludingCategory.mockResolvedValue([]);
	});

	it('propagates a 404 when the Gas category is missing', async () => {
		const caught = await rejection(
			load(event(async () => ({ categories: [{ id: 'other', name: 'Food' }] })))
		);
		expect(isHttpError(caught) && caught.status).toBe(404);
		expect(mockState.loggerError).not.toHaveBeenCalled();
	});

	it('propagates HTTP errors thrown by the parent load', async () => {
		const caught = await rejection(
			load(
				event(async () => {
					throw error(500, 'Parent failed');
				})
			)
		);
		expect(isHttpError(caught) && caught.status).toBe(500);
		expect(mockState.loggerError).not.toHaveBeenCalled();
	});

	it('propagates redirects thrown by the parent load', async () => {
		const caught = await rejection(
			load(
				event(async () => {
					throw redirect(303, '/login');
				})
			)
		);
		expect(isRedirect(caught)).toBe(true);
	});

	it('returns loadError when the transaction queries fail', async () => {
		mockState.findByCategory.mockRejectedValue(new Error('db down'));
		mockState.findByDateRangeExcludingCategory.mockRejectedValue(new Error('db down'));

		const result = (await load(event(async () => ({ categories: [GAS] })))) as Record<
			string,
			unknown
		>;

		expect(result.loadError).toEqual(expect.any(String));
		expect(result.monthlyTransactions).toEqual([]);
		expect(result.yearlyTransactions).toEqual([]);
		expect(result.form).toBeDefined();
		expect(mockState.loggerError).toHaveBeenCalledOnce();
	});
});
