import { describe, expect, it } from 'vitest';

import type { Transaction } from '../types';
import { calculateTransactionSummary } from './transaction-summary';

const t = (amount: number, excludedFromBudget = false) =>
	({ amount, excludedFromBudget }) as unknown as Transaction;

describe('calculateTransactionSummary', () => {
	describe('monthlyTotal', () => {
		it('sums only non-excluded transactions', () => {
			const monthly = [t(100), t(200), t(50, true)];
			const { monthlyTotal } = calculateTransactionSummary(monthly, [], 5);
			expect(monthlyTotal).toBe(300);
		});

		it('returns 0 when all transactions are excluded from budget', () => {
			const monthly = [t(100, true), t(200, true)];
			const { monthlyTotal } = calculateTransactionSummary(monthly, [], 5);
			expect(monthlyTotal).toBe(0);
		});
	});

	describe('yearlyTotal', () => {
		it('sums only non-excluded yearly transactions', () => {
			const yearly = [t(400), t(600), t(100, true)];
			const { yearlyTotal } = calculateTransactionSummary([], yearly, 5);
			expect(yearlyTotal).toBe(1000);
		});
	});

	describe('monthlyAverage', () => {
		it('divides yearlyTotal by completedMonths', () => {
			const yearly = [t(500), t(500)];
			const { monthlyAverage } = calculateTransactionSummary([], yearly, 5);
			expect(monthlyAverage).toBe(200);
		});

		it('returns null when completedMonths is 0', () => {
			const yearly = [t(1000)];
			const { monthlyAverage } = calculateTransactionSummary([], yearly, 0);
			expect(monthlyAverage).toBeNull();
		});

		it('returns null when yearly transactions array is empty', () => {
			const { monthlyAverage } = calculateTransactionSummary([], [], 5);
			expect(monthlyAverage).toBeNull();
		});
	});
});
