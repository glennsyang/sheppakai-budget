import type { Budget, Transaction, User } from '$lib/types';
import { describe, expect, it } from 'vitest';

import { computeCategoryAnomalies, type HistoricalMonthRange } from './category-anomalies';

const fixtureUser: User = {
	id: 'user-1',
	name: 'Test User',
	email: 'test@example.com',
	emailVerified: true,
	createdAt: '2026-01-01',
	updatedAt: '2026-01-01'
};

function buildTx(
	categoryId: string,
	categoryName: string,
	amount: number,
	date: string
): Transaction {
	return {
		id: `${categoryId}-${date}`,
		amount,
		payee: 'Test Payee',
		notes: '',
		date,
		gstAmount: null,
		excludedFromBudget: false,
		category: { id: categoryId, name: categoryName, description: '', createdAt: '', updatedAt: '' },
		user: fixtureUser
	};
}

// Jan-Jun 2026, with June as the "current" month.
const sixMonthRange: HistoricalMonthRange[] = [
	{ monthStart: '2026-01-01', monthEnd: '2026-01-31' },
	{ monthStart: '2026-02-01', monthEnd: '2026-02-28' },
	{ monthStart: '2026-03-01', monthEnd: '2026-03-31' },
	{ monthStart: '2026-04-01', monthEnd: '2026-04-30' },
	{ monthStart: '2026-05-01', monthEnd: '2026-05-31' },
	{ monthStart: '2026-06-01', monthEnd: '2026-06-30' }
];

const priorMonthStarts = sixMonthRange.slice(0, -1).map((range) => range.monthStart);

function buildPriorMonthsSpend(
	categoryId: string,
	categoryName: string,
	amount: number
): Transaction[] {
	return priorMonthStarts.map((monthStart) =>
		buildTx(categoryId, categoryName, amount, monthStart)
	);
}

function buildBudget(categoryId: string, categoryName: string, amount: number): Budget {
	return {
		id: `budget-${categoryId}`,
		amount,
		month: '6',
		year: '2026',
		category: { id: categoryId, name: categoryName, description: '', createdAt: '', updatedAt: '' },
		user: fixtureUser
	};
}

describe('computeCategoryAnomalies', () => {
	it('flags a category spending more than 25% over its trailing average', () => {
		const transactions = [
			...buildPriorMonthsSpend('groceries', 'Groceries', 100),
			buildTx('groceries', 'Groceries', 140, '2026-06-15')
		];

		const anomalies = computeCategoryAnomalies(transactions, sixMonthRange);

		expect(anomalies).toEqual([
			{
				categoryId: 'groceries',
				categoryName: 'Groceries',
				currentAmount: 140,
				trailingAverage: 100,
				percentOver: 40
			}
		]);
	});

	it('does not flag a category within 25% of its trailing average', () => {
		const transactions = [
			...buildPriorMonthsSpend('dining', 'Dining Out', 100),
			buildTx('dining', 'Dining Out', 120, '2026-06-15')
		];

		expect(computeCategoryAnomalies(transactions, sixMonthRange)).toEqual([]);
	});

	it('ignores categories whose trailing average is below the minimum baseline', () => {
		const transactions = [
			...buildPriorMonthsSpend('parking', 'Parking', 10),
			buildTx('parking', 'Parking', 50, '2026-06-15')
		];

		expect(computeCategoryAnomalies(transactions, sixMonthRange)).toEqual([]);
	});

	it('returns no anomalies when there is not enough prior-month history', () => {
		const shortRange = sixMonthRange.slice(-3); // only 2 prior months
		const transactions = [
			buildTx('groceries', 'Groceries', 100, '2026-04-15'),
			buildTx('groceries', 'Groceries', 100, '2026-05-15'),
			buildTx('groceries', 'Groceries', 500, '2026-06-15')
		];

		expect(computeCategoryAnomalies(transactions, shortRange)).toEqual([]);
	});

	it('ignores transactions with no category', () => {
		const transactions: Transaction[] = [
			...buildPriorMonthsSpend('groceries', 'Groceries', 100).map((tx) => ({
				...tx,
				category: null
			})),
			{ ...buildTx('groceries', 'Groceries', 200, '2026-06-15'), category: null }
		];

		expect(computeCategoryAnomalies(transactions, sixMonthRange)).toEqual([]);
	});

	it('sorts by percent-over descending and caps at 5 results', () => {
		const transactions = Array.from({ length: 6 }, (_, i) => {
			const categoryId = `cat-${i}`;
			// Trailing average of 50, current spend increasing with i so percentOver descends as i increases: cat-0 is highest.
			const currentAmount = 150 - i * 10;
			return [
				...buildPriorMonthsSpend(categoryId, `Category ${i}`, 50),
				buildTx(categoryId, `Category ${i}`, currentAmount, '2026-06-15')
			];
		}).flat();

		const anomalies = computeCategoryAnomalies(transactions, sixMonthRange);

		expect(anomalies).toHaveLength(5);
		expect(anomalies.map((a) => a.categoryId)).toEqual([
			'cat-0',
			'cat-1',
			'cat-2',
			'cat-3',
			'cat-4'
		]);
		expect(anomalies).toEqual([...anomalies].sort((a, b) => b.percentOver - a.percentOver));
	});

	it('does not flag a category spending at or under its budget for the current month', () => {
		const transactions = [
			...buildPriorMonthsSpend('groceries', 'Groceries', 100),
			buildTx('groceries', 'Groceries', 140, '2026-06-15')
		];
		const budgets = [buildBudget('groceries', 'Groceries', 140)];

		expect(computeCategoryAnomalies(transactions, sixMonthRange, budgets)).toEqual([]);
	});

	it('still flags a category that spends over both its trailing average and its budget', () => {
		const transactions = [
			...buildPriorMonthsSpend('groceries', 'Groceries', 100),
			buildTx('groceries', 'Groceries', 140, '2026-06-15')
		];
		const budgets = [buildBudget('groceries', 'Groceries', 120)];

		const anomalies = computeCategoryAnomalies(transactions, sixMonthRange, budgets);

		expect(anomalies).toEqual([
			{
				categoryId: 'groceries',
				categoryName: 'Groceries',
				currentAmount: 140,
				trailingAverage: 100,
				percentOver: 40
			}
		]);
	});

	it('falls back to average-only detection when no budget is set for the category', () => {
		const transactions = [
			...buildPriorMonthsSpend('groceries', 'Groceries', 100),
			buildTx('groceries', 'Groceries', 140, '2026-06-15')
		];

		const anomalies = computeCategoryAnomalies(transactions, sixMonthRange, []);

		expect(anomalies).toEqual([
			{
				categoryId: 'groceries',
				categoryName: 'Groceries',
				currentAmount: 140,
				trailingAverage: 100,
				percentOver: 40
			}
		]);
	});
});
