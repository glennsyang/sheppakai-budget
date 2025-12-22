import { fail } from '@sveltejs/kit';
import { and, desc, eq, sql } from 'drizzle-orm';

import type { Budget,Transaction } from '$lib';
import { getDb } from '$lib/server/db';
import { budget,transaction } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';

import type { Actions,PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return { transactions: [] };
	}

	// Get month and year from URL or use current month/year
	const currentDate = new Date();
	const monthParam = url.searchParams.get('month');
	const yearParam = url.searchParams.get('year');

	const month = monthParam ? Number.parseInt(monthParam) : currentDate.getMonth() + 1;
	const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear();

	const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	const transactions: Transaction[] = (await getDb().query.transaction.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			sql`date(${transaction.date}) >= date(${startDate})`,
			sql`date(${transaction.date}) <= date(${endDate})`
		),
		orderBy: [desc(transaction.date)]
	})) as Transaction[];

	// Load budgets for the current month/year
	const budgets: Budget[] = (await getDb().query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(eq(budget.month, month.toString()), eq(budget.year, year.toString()))
	})) as Budget[];

	// Calculate spending per category
	const categorySpending = transactions.reduce(
		(acc, txn) => {
			if (txn.category) {
				const categoryId = txn.category.id;
				acc[categoryId] = (acc[categoryId] || 0) + txn.amount;
			}
			return acc;
		},
		{} as Record<string, number>
	);

	return {
		transactions,
		budgets,
		categorySpending
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasAmount = data.has('amount');
		const hasPayee = data.has('payee');
		const hasNotes = data.has('notes');
		const hasDate = data.has('date');
		const hasCategoryId = data.has('categoryId');

		if (!hasAmount || !hasNotes || !hasDate || !hasCategoryId || !hasPayee) {
			return fail(400, { hasAmount, hasNotes, hasDate, hasCategoryId, hasPayee });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(transaction)
				.values(
					withAuditFieldsForCreate(
						{
							amount: Number(data.get('amount')),
							payee: data.get('payee')?.toString() || '',
							notes: data.get('notes')?.toString() || '',
							date: data.get('date')?.toString() || '',
							categoryId: data.get('categoryId')?.toString() || '',
							userId: userId
						},
						userId
					)
				);

			console.log('Created transaction entry for user:', userId);
		} catch (error) {
			console.error('Error creating transaction entry:', error);
			return fail(500, { error: 'Failed to create transaction entry' });
		}

		return { success: true, create: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasAmount = data.has('amount');
		const hasPayee = data.has('payee');
		const hasNotes = data.has('notes');
		const hasDate = data.has('date');
		const hasCategoryId = data.has('categoryId');

		if (!hasId || !hasAmount || !hasPayee || !hasNotes || !hasDate || !hasCategoryId) {
			return fail(400, { hasId, hasAmount, hasPayee, hasNotes, hasDate, hasCategoryId });
		}

		// Update the transaction entry in the database
		const transactionId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(transaction)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: Number(data.get('amount')),
							payee: data.get('payee')?.toString() || '',
							notes: data.get('notes')?.toString() || '',
							date: data.get('date')?.toString() || '',
							categoryId: data.get('categoryId')?.toString() || ''
						},
						userId
					)
				)
				.where(eq(transaction.id, transactionId));

			console.log('Updated transaction entry:', transactionId);
		} catch (error) {
			console.error('Error updating transaction entry:', error);
			return fail(500, { error: 'Failed to update transaction entry' });
		}

		return { success: true, update: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const transactionId = data.get('id')!.toString();

		try {
			await getDb().delete(transaction).where(eq(transaction.id, transactionId));

			console.log('Deleted transaction entry:', transactionId);
		} catch (error) {
			console.error('Error deleting transaction entry:', error);
			return fail(500, { error: 'Failed to delete transaction entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
