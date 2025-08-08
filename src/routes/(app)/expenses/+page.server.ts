import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { categories, expenses, users } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	return {
		expenses: await db
			.select({
				id: expenses.id,
				amount: expenses.amount,
				description: expenses.description,
				date: expenses.date,
				category: {
					id: categories.id,
					name: categories.name
				},
				user: {
					id: users.id,
					email: users.email,
					firstName: users.firstName,
					lastName: users.lastName
				}
			})
			.from(expenses)
			.innerJoin(categories, eq(expenses.category_id, categories.id))
			.innerJoin(users, eq(expenses.user_id, users.id))
			.where(eq(expenses.user_id, locals.user.id.toString()))
	};
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return { status: 401 };
		}

		const data = await request.formData();

		console.log('Creating expense entry with data:', data);

		const hasAmount = data.has('amount');
		const hasDescription = data.has('description');
		const hasDate = data.has('date');
		const hasCategoryId = data.has('categoryId');

		if (!hasAmount || !hasDescription || !hasDate || !hasCategoryId) {
			return fail(400, { hasAmount, hasDescription, hasDate, hasCategoryId });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(expenses).values(
				withAuditFieldsForCreate(
					{
						user_id: userId,
						amount: Number(data.get('amount')),
						description: data.get('description')?.toString() || '',
						date: data.get('date')?.toString() || '',
						category_id: data.get('categoryId')?.toString()
					},
					userId
				)
			);
		} catch (error) {
			console.error('Error creating expense entry:', error);
			return fail(500, { error: 'Failed to create expense entry' });
		}

		return { success: true, create: true };
	},
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return { status: 401 };
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
				.update(expenses)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: Number(data.get('amount')),
							description: data.get('description')?.toString() || '',
							date: data.get('date')?.toString() || '',
							category_id: data.get('categoryId')?.toString()
						},
						userId
					)
				)
				.where(eq(expenses.id, expenseId));

			console.log('Updated expense entry:', expenseId);
		} catch (error) {
			console.error('Error updating expense entry:', error);
			return fail(500, { error: 'Failed to update expense entry' });
		}

		return { success: true, update: true };
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return { status: 401 };
		}

		const data = await request.formData();

		const hasId = data.has('id');
		if (!hasId) {
			return fail(400, { hasId });
		}

		const expenseId = data.get('id')!.toString();

		try {
			await db.delete(expenses).where(eq(expenses.id, expenseId));

			console.log('Deleted expense entry:', expenseId);
		} catch (error) {
			console.error('Error deleting expense entry:', error);
			return fail(500, { error: 'Failed to delete expense entry' });
		}

		return { success: true, update: true };
	}
};
