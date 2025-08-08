import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { income, users } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	return {
		income: await db
			.select({
				id: income.id,
				amount: income.amount,
				description: income.description,
				date: income.date,
				user: {
					id: users.id,
					email: users.email,
					firstName: users.firstName,
					lastName: users.lastName
				}
			})
			.from(income)
			.innerJoin(users, eq(income.user_id, users.id))
			.where(eq(income.user_id, locals.user.id.toString()))
	};
};

export const actions = {
	create: async ({ request, locals, url }) => {
		if (!locals.user) {
			return { status: 401 };
		}

		const data = await request.formData();

		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');

		if (!hasAmount || !hasDescription || !hasDate) {
			return fail(400, { hasAmount, hasDescription, hasDate });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(income).values(
				withAuditFieldsForCreate(
					{
						user_id: userId,
						amount: Number(data.get('amount')),
						description: data.get('description')?.toString() || '',
						date: data.get('date')?.toString() || ''
					},
					userId
				)
			);
		} catch (error) {
			console.error('Error creating income entry:', error);
			return fail(500, { error: 'Failed to create income entry' });
		}

		console.log('url:', url);

		return { success: true, create: true };
	},
	update: async ({ request, locals, url }) => {
		if (!locals.user) {
			return { status: 401 };
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');

		if (!hasId || !hasAmount || !hasDescription || !hasDate) {
			return fail(400, { hasId, hasDescription, hasAmount, hasDate });
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
							date: data.get('date')?.toString() || ''
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

		if (!url.origin.includes('income')) {
			redirect(303, '/');
		}

		return { success: true, update: true };
	},
	delete: async ({ request, locals, url }) => {
		if (!locals.user) {
			return { status: 401 };
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

		if (!url.origin.includes('income')) {
			redirect(303, '/');
		}

		return { success: true, update: true };
	}
} satisfies Actions;
