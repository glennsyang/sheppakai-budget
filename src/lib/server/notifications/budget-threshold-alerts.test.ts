import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	budgetFindMany: vi.fn(),
	transactionFindMany: vi.fn(),
	transactionFindFirst: vi.fn(),
	sendBudgetAlerts: vi.fn(),
	loggerInfo: vi.fn(),
	loggerError: vi.fn()
}));

vi.mock('$lib/server/db', () => ({
	getDb: () => ({
		query: {
			budget: {
				findMany: mockState.budgetFindMany
			},
			transaction: {
				findMany: mockState.transactionFindMany,
				findFirst: mockState.transactionFindFirst
			}
		}
	})
}));

vi.mock('$lib/server/logger', () => ({
	logger: {
		info: mockState.loggerInfo,
		error: mockState.loggerError
	}
}));

vi.mock('./index', () => ({
	sendBudgetAlerts: mockState.sendBudgetAlerts
}));

import {
	buildTransactionBudgetAlertUpdateContext,
	evaluateCreatedTransactionBudgetAlert,
	evaluateUpdatedTransactionBudgetAlert,
	getBudgetThresholdAlertType,
	getBudgetThresholdState
} from './budget-threshold-alerts';

describe('budget-threshold-alerts', () => {
	beforeEach(() => {
		mockState.budgetFindMany.mockReset();
		mockState.transactionFindMany.mockReset();
		mockState.transactionFindFirst.mockReset();
		mockState.sendBudgetAlerts.mockReset();
		mockState.loggerInfo.mockReset();
		mockState.loggerError.mockReset();

		mockState.sendBudgetAlerts.mockResolvedValue(true);
	});

	it('classifies threshold states correctly', () => {
		expect(getBudgetThresholdState(89, 100)).toBe('below');
		expect(getBudgetThresholdState(90, 100)).toBe('near');
		expect(getBudgetThresholdState(100, 100)).toBe('near');
		expect(getBudgetThresholdState(101, 100)).toBe('over');
	});

	it('derives upward-only alert types correctly', () => {
		expect(getBudgetThresholdAlertType('below', 'near')).toBe('near');
		expect(getBudgetThresholdAlertType('below', 'over')).toBe('over');
		expect(getBudgetThresholdAlertType('near', 'over')).toBe('over');
		expect(getBudgetThresholdAlertType('near', 'near')).toBeNull();
		expect(getBudgetThresholdAlertType('over', 'near')).toBeNull();
	});

	it('sends a 90 percent alert when a create crosses into the near-threshold range', async () => {
		mockState.budgetFindMany.mockResolvedValue([{ amount: 100, category: { name: 'Groceries' } }]);
		mockState.transactionFindMany.mockResolvedValue([{ amount: 80 }, { amount: 10 }]);

		await evaluateCreatedTransactionBudgetAlert({
			id: 'tx-1',
			userId: 'user-1',
			categoryId: 'cat-1',
			amount: 10,
			date: '2026-03-10 08:15:00'
		});

		expect(mockState.sendBudgetAlerts).toHaveBeenCalledWith(
			'Groceries reached 90% of the March 2026 budget: $90.00 of $100.00 spent.',
			'Category at 90% of budget',
			3
		);
	});

	it('sends only the over-budget alert when a create jumps from below 90 to above 100', async () => {
		mockState.budgetFindMany.mockResolvedValue([{ amount: 100, category: { name: 'Groceries' } }]);
		mockState.transactionFindMany.mockResolvedValue([{ amount: 80 }, { amount: 30 }]);

		await evaluateCreatedTransactionBudgetAlert({
			id: 'tx-2',
			userId: 'user-1',
			categoryId: 'cat-1',
			amount: 30,
			date: '2026-03-11 12:00:00'
		});

		expect(mockState.sendBudgetAlerts).toHaveBeenCalledWith(
			'Groceries is over the March 2026 budget at 110%: $110.00 of $100.00 spent.',
			'Category over budget',
			4
		);
	});

	it('skips notifications when no budget exists for the category-month', async () => {
		mockState.budgetFindMany.mockResolvedValue([]);
		mockState.transactionFindMany.mockResolvedValue([{ amount: 25 }]);

		await evaluateCreatedTransactionBudgetAlert({
			id: 'tx-3',
			userId: 'user-1',
			categoryId: 'cat-1',
			amount: 25,
			date: '2026-03-12 10:00:00'
		});

		expect(mockState.sendBudgetAlerts).not.toHaveBeenCalled();
	});

	it('passes through the previous transaction snapshot for update evaluation', async () => {
		mockState.transactionFindFirst.mockResolvedValue({
			id: 'tx-4',
			userId: 'user-1',
			categoryId: 'cat-1',
			amount: 5,
			date: '2026-03-10 08:15:00'
		});

		const result = await buildTransactionBudgetAlertUpdateContext('tx-4');

		expect(result).toEqual({
			previousTransaction: {
				id: 'tx-4',
				userId: 'user-1',
				categoryId: 'cat-1',
				amount: 5,
				date: '2026-03-10 08:15:00'
			}
		});
	});

	it('sends a 90 percent alert when an update increases spend in the same bucket across the threshold', async () => {
		mockState.budgetFindMany.mockResolvedValue([{ amount: 100, category: { name: 'Groceries' } }]);
		mockState.transactionFindMany.mockResolvedValue([{ amount: 95 }]);

		await evaluateUpdatedTransactionBudgetAlert(
			{
				amount: 15,
				categoryId: 'cat-1',
				date: '2026-03-10 08:15:00'
			},
			{
				previousTransaction: {
					id: 'tx-5',
					userId: 'user-1',
					categoryId: 'cat-1',
					amount: 5,
					date: '2026-03-10 08:15:00'
				}
			}
		);

		expect(mockState.sendBudgetAlerts).toHaveBeenCalledWith(
			'Groceries reached 95% of the March 2026 budget: $95.00 of $100.00 spent.',
			'Category at 90% of budget',
			3
		);
	});

	it('evaluates the new bucket only when an update moves a transaction to another category-month', async () => {
		mockState.budgetFindMany.mockResolvedValue([{ amount: 100, category: { name: 'Dining Out' } }]);
		mockState.transactionFindMany.mockResolvedValue([{ amount: 80 }, { amount: 25 }]);

		await evaluateUpdatedTransactionBudgetAlert(
			{
				amount: 25,
				categoryId: 'cat-2',
				date: '2026-04-01 09:00:00'
			},
			{
				previousTransaction: {
					id: 'tx-6',
					userId: 'user-1',
					categoryId: 'cat-1',
					amount: 10,
					date: '2026-03-30 09:00:00'
				}
			}
		);

		expect(mockState.sendBudgetAlerts).toHaveBeenCalledWith(
			'Dining Out is over the April 2026 budget at 105%: $105.00 of $100.00 spent.',
			'Category over budget',
			4
		);
	});
});
