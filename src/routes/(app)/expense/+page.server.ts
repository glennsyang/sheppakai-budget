import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { expense } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	return {
		expenses: await db.query.expense.findMany({
			with: {
				category: true,
				user: true
			},
			orderBy: [desc(expense.date)]
		}),
		categories: await db.query.category.findMany()
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasCategoryId = data.has('categoryId');

		if (!hasAmount || !hasDescription || !hasDate || !hasCategoryId) {
			return fail(400, { hasAmount, hasDescription, hasDate, hasCategoryId });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(expense).values(
				withAuditFieldsForCreate(
					{
						amount: Number(data.get('amount')),
						description: data.get('description')?.toString() || '',
						date: data.get('date')?.toString() || '',
						categoryId: data.get('categoryId')?.toString() || '',
						userId: userId
					},
					userId
				)
			);

			console.log('Created expense entry for user:', userId);
		} catch (error) {
			console.error('Error creating expense entry:', error);
			return fail(500, { error: 'Failed to create expense entry' });
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
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasCategoryId = data.has('categoryId');

		if (!hasId || !hasAmount || !hasDescription || !hasDate || !hasCategoryId) {
			return fail(400, { hasId, hasDescription, hasAmount, hasDate, hasCategoryId });
		}

		// Update the expense entry in the database
		const expenseId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await db
				.update(expense)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: Number(data.get('amount')),
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							categoryId: data.get('categoryId')?.toString()
						},
						userId
					)
				)
				.where(eq(expense.id, expenseId));

			console.log('Updated expense entry:', expenseId);
		} catch (error) {
			console.error('Error updating expense entry:', error);
			return fail(500, { error: 'Failed to update expense entry' });
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

		const expenseId = data.get('id')!.toString();

		try {
			await db.delete(expense).where(eq(expense.id, expenseId));

			console.log('Deleted expense entry:', expenseId);
		} catch (error) {
			console.error('Error deleting expense entry:', error);
			return fail(500, { error: 'Failed to delete expense entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
