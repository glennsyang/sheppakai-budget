import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { asc, eq } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { income } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { incomes: [] };
	}

	const incomes = await getDb().query.income.findMany({
		orderBy: [asc(income.date)]
	});

	return { incomes };
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasName = data.has('name');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasAmount = data.has('amount');

		if (!hasName || !hasDescription || !hasDate || !hasAmount) {
			return fail(400, { hasName, hasDescription, hasDate, hasAmount });
		}

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.insert(income)
				.values(
					withAuditFieldsForCreate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							amount: Number(data.get('amount')),
							userId: userId
						},
						userId
					)
				);

			console.log('Created income for user:', userId);
		} catch (error) {
			console.error('Error creating income:', error);
			return fail(500, { error: 'Failed to create income' });
		}

		return { success: true, create: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasName = data.has('name');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasAmount = data.has('amount');

		if (!hasId || !hasName || !hasDescription || !hasDate || !hasAmount) {
			return fail(400, { hasId, hasName, hasDescription, hasDate, hasAmount });
		}

		const incomeId = data.get('id')!.toString();

		try {
			const userId = locals.user.id.toString();

			await getDb()
				.update(income)
				.set(
					withAuditFieldsForUpdate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							amount: Number(data.get('amount'))
						},
						userId
					)
				)
				.where(eq(income.id, incomeId));

			console.log('Updated income:', incomeId);
		} catch (error) {
			console.error('Error updating income:', error);
			return fail(500, { error: 'Failed to update income' });
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
			await getDb().delete(income).where(eq(income.id, incomeId));

			console.log('Deleted income:', incomeId);
		} catch (error) {
			console.error('Error deleting income:', error);
			return fail(500, { error: 'Failed to delete income' });
		}

		return { success: true, delete: true };
	}
} satisfies Actions;
