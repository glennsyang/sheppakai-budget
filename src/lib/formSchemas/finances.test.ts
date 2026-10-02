import type { Recurring, Transaction } from '$lib/types';
import { describe, expect, it } from 'vitest';

import {
	recurringSchema,
	toRecurringFormData,
	toTransactionFormData,
	transactionSchema
} from './finances';

const user: Transaction['user'] = {
	id: 'u1',
	name: 'Test User',
	email: 'test@example.com',
	emailVerified: true,
	image: null,
	role: 'user',
	banned: false,
	banReason: null,
	banExpires: null,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
};

const audit = { createdAt: '', createdBy: 'u1', updatedAt: '', updatedBy: 'u1' };

const transaction: Transaction = {
	id: 't1',
	amount: 42.5,
	payee: 'Costco',
	notes: 'Groceries',
	date: '2026-09-15',
	gstAmount: 2.1,
	excludedFromBudget: true,
	categoryId: 'c1',
	category: { id: 'c1', name: 'Food', description: '', ...audit },
	userId: 'u1',
	...audit,
	user
};

const recurring: Recurring = {
	id: 'r1',
	merchant: 'Netflix',
	description: 'Streaming',
	cadence: 'Yearly',
	amount: 199,
	paid: false,
	dueDay: 15,
	dueMonth: 3,
	userId: 'u1',
	...audit,
	user
};

describe('toTransactionFormData', () => {
	it('covers every transactionSchema key', () => {
		expect(Object.keys(toTransactionFormData(transaction)).sort()).toEqual(
			Object.keys(transactionSchema.shape).sort()
		);
	});

	it('preserves excludedFromBudget and passes validation', () => {
		const data = toTransactionFormData(transaction);
		expect(data.excludedFromBudget).toBe(true);
		expect(data.categoryId).toBe('c1');
		expect(transactionSchema.safeParse(data).success).toBe(true);
	});
});

describe('toRecurringFormData', () => {
	it('covers every recurringSchema key', () => {
		expect(Object.keys(toRecurringFormData(recurring)).sort()).toEqual(
			Object.keys(recurringSchema.shape).sort()
		);
	});

	it('preserves dueDay/dueMonth and passes validation', () => {
		const data = toRecurringFormData(recurring);
		expect(data.dueDay).toBe(15);
		expect(data.dueMonth).toBe(3);
		expect(recurringSchema.safeParse(data).success).toBe(true);
	});
});
