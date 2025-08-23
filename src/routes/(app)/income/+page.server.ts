import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { desc, eq } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { income } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	return {
		income: await db.query.income.findMany({
			with: {
				category: true,
				user: true
			},
			orderBy: [desc(income.date)]
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

			await db.insert(income).values(
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

			console.log('Created income entry for user:', userId);
		} catch (error) {
			console.error('Error creating income entry:', error);
			return fail(500, { error: 'Failed to create income entry' });
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

		// Update the income entry in the database
		const incomeId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await db
				.update(income)
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
				.where(eq(income.id, incomeId));

			console.log('Updated income entry:', incomeId);
		} catch (error) {
			console.error('Error updating income entry:', error);
			return fail(500, { error: 'Failed to update income entry' });
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

		const incomeId = data.get('id')!.toString();

		try {
			await db.delete(income).where(eq(income.id, incomeId));

			console.log('Deleted income entry:', incomeId);
		} catch (error) {
			console.error('Error deleting income entry:', error);
			return fail(500, { error: 'Failed to delete income entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
