import { describe, expect, it } from 'vitest';

import {
	banUserSchema,
	budgetSchema,
	categorySchema,
	changePasswordSchema,
	contributionSchema,
	incomeSchema,
	recurringSchema,
	registerSchema,
	savingsGoalSchema,
	savingsSchema,
	signInSchema,
	transactionSchema,
	unArchiveSchema,
	windowCleaningCustomerSchema,
	windowCleaningJobSchema
} from './index';

describe('form schemas', () => {
	it('validates sign-in schema', () => {
		expect(
			signInSchema.safeParse({ email: 'user@example.com', password: 'longpassword12' }).success
		).toBe(true);
		expect(
			signInSchema.safeParse({ email: 'not-an-email', password: 'longpassword12' }).success
		).toBe(false);
		expect(signInSchema.safeParse({ email: 'user@example.com', password: 'short' }).success).toBe(
			false
		);
	});

	it('validates register password confirmation', () => {
		expect(
			registerSchema.safeParse({
				email: 'user@example.com',
				name: 'Valid User',
				password: 'strongpassword12',
				confirmPassword: 'strongpassword12'
			}).success
		).toBe(true);

		const mismatch = registerSchema.safeParse({
			email: 'user@example.com',
			name: 'Valid User',
			password: 'strongpassword12',
			confirmPassword: 'differentpassword12'
		});
		expect(mismatch.success).toBe(false);
	});

	it('validates budget month and year ranges', () => {
		expect(
			budgetSchema.safeParse({
				amount: 100,
				month: '03',
				year: '2026',
				categoryId: 'cat-1',
				presetType: 'custom'
			}).success
		).toBe(true);
		expect(
			budgetSchema.safeParse({ amount: 100, month: '13', year: '2026', categoryId: 'cat-1' })
				.success
		).toBe(false);
		expect(
			budgetSchema.safeParse({ amount: 100, month: '03', year: '1999', categoryId: 'cat-1' })
				.success
		).toBe(false);
	});

	it('validates transaction and income date format', () => {
		expect(
			transactionSchema.safeParse({
				amount: 20,
				payee: 'Store',
				notes: 'Groceries',
				date: '2026-03-01',
				categoryId: 'cat-1'
			}).success
		).toBe(true);
		expect(
			transactionSchema.safeParse({
				amount: 20,
				payee: 'Store',
				notes: 'Groceries',
				date: '03/01/2026',
				categoryId: 'cat-1'
			}).success
		).toBe(false);

		expect(
			incomeSchema.safeParse({
				name: 'Salary',
				description: 'Monthly salary',
				date: '2026-03-01',
				amount: 5000
			}).success
		).toBe(true);
		expect(
			incomeSchema.safeParse({
				name: 'Salary',
				description: 'Monthly salary',
				date: '2026/03/01',
				amount: 5000
			}).success
		).toBe(false);
	});

	it('validates recurring and category required fields', () => {
		expect(
			recurringSchema.safeParse({
				amount: 10,
				description: 'Netflix',
				merchant: 'Netflix',
				cadence: 'monthly'
			}).success
		).toBe(true);
		expect(
			recurringSchema.safeParse({ amount: 10, description: '', merchant: 'N', cadence: 'monthly' })
				.success
		).toBe(false);

		expect(
			categorySchema.safeParse({ name: 'Food', description: 'All food spending' }).success
		).toBe(true);
		expect(categorySchema.safeParse({ name: '', description: 'All food spending' }).success).toBe(
			false
		);
	});

	it('validates savings and savings goal rules', () => {
		expect(savingsSchema.safeParse({ title: 'Emergency Fund', amount: 1000 }).success).toBe(true);
		expect(savingsSchema.safeParse({ title: 'Emergency Fund', amount: -1 }).success).toBe(false);

		expect(
			savingsGoalSchema.safeParse({
				name: 'New Laptop',
				targetAmount: 2000,
				targetDate: '2026-12-31',
				status: 'active'
			}).success
		).toBe(true);
		expect(
			savingsGoalSchema.safeParse({
				name: 'New Laptop',
				targetAmount: 2000,
				targetDate: '12-31-2026',
				status: 'active'
			}).success
		).toBe(false);
	});

	it('validates contribution and unarchive identifiers', () => {
		expect(
			contributionSchema.safeParse({ goalId: 'goal-1', amount: 100, date: '2026-03-01' }).success
		).toBe(true);
		expect(
			contributionSchema.safeParse({ goalId: '', amount: 100, date: '2026-03-01' }).success
		).toBe(false);

		expect(unArchiveSchema.safeParse({ goalId: 'goal-1' }).success).toBe(true);
		expect(unArchiveSchema.safeParse({ goalId: '' }).success).toBe(false);
	});

	it('validates password and moderation schemas', () => {
		expect(
			changePasswordSchema.safeParse({
				currentPassword: 'currentpassword12',
				newPassword: 'newpassword1234',
				confirmPassword: 'newpassword1234'
			}).success
		).toBe(true);
		expect(
			changePasswordSchema.safeParse({
				currentPassword: 'currentpassword12',
				newPassword: 'newpassword1234',
				confirmPassword: 'differentpassword'
			}).success
		).toBe(false);

		expect(banUserSchema.safeParse({ userId: 'user-1', banReason: 'spam' }).success).toBe(true);
		expect(banUserSchema.safeParse({ userId: '', banReason: 'spam' }).success).toBe(false);
	});

	it('validates windowCleaningCustomerSchema required fields and lengths', () => {
		expect(
			windowCleaningCustomerSchema.safeParse({
				name: 'John Doe',
				address: '123 Main St',
				city: 'Vancouver'
			}).success
		).toBe(true);

		// Missing required name
		expect(
			windowCleaningCustomerSchema.safeParse({
				name: '',
				address: '123 Main St',
				city: 'Vancouver'
			}).success
		).toBe(false);

		// Missing required address
		expect(
			windowCleaningCustomerSchema.safeParse({ name: 'John', address: '', city: 'Vancouver' })
				.success
		).toBe(false);

		// Missing required city
		expect(
			windowCleaningCustomerSchema.safeParse({ name: 'John', address: '123 Main St', city: '' })
				.success
		).toBe(false);

		// Address too long (>200 chars)
		expect(
			windowCleaningCustomerSchema.safeParse({
				name: 'John',
				address: 'A'.repeat(201),
				city: 'Vancouver'
			}).success
		).toBe(false);
	});

	it('validates windowCleaningJobSchema date format and required fields', () => {
		expect(
			windowCleaningJobSchema.safeParse({
				customerId: 'cust-1',
				jobDate: '2026-05-01',
				amountCharged: 75
			}).success
		).toBe(true);

		// Invalid date format
		expect(
			windowCleaningJobSchema.safeParse({
				customerId: 'cust-1',
				jobDate: '05/01/2026',
				amountCharged: 75
			}).success
		).toBe(false);

		// Missing customerId
		expect(
			windowCleaningJobSchema.safeParse({
				customerId: '',
				jobDate: '2026-05-01',
				amountCharged: 75
			}).success
		).toBe(false);

		// Non-positive amountCharged
		expect(
			windowCleaningJobSchema.safeParse({
				customerId: 'cust-1',
				jobDate: '2026-05-01',
				amountCharged: 0
			}).success
		).toBe(false);

		// Negative tip
		expect(
			windowCleaningJobSchema.safeParse({
				customerId: 'cust-1',
				jobDate: '2026-05-01',
				amountCharged: 75,
				tip: -5
			}).success
		).toBe(false);
	});
});
