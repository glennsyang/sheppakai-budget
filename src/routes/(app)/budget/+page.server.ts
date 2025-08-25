import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { and, desc, eq } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { budget } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return [];
	}

	// Get month from URL or use current month
	const monthParam = url.searchParams.get('month');
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1;

	// Get year from URL or use current year
	const yearParam = url.searchParams.get('year');
	const currentYear = currentDate.getFullYear();

	let year = currentYear;
	let month = currentMonth;
	if (monthParam && yearParam) {
		year = parseInt(yearParam);
		month = parseInt(monthParam);
	}

	return {
		budget: await db.query.budget.findMany({
			with: {
				category: true,
				user: true
			},
			where: and(
				eq(budget.year, year.toString()),
				eq(budget.month, month.toString().padStart(2, '0'))
			),
			orderBy: [desc(budget.year), desc(budget.month)]
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
		console.log('data:', JSON.stringify(Object.fromEntries(data.entries())));
		const hasAmount = data.has('amount');
		const hasYear = data.has('year');
		const hasMonth = data.has('month');
		const hasCategoryId = data.has('categoryId');

		if (!hasAmount || !hasYear || !hasMonth || !hasCategoryId) {
			return fail(400, { hasAmount, hasYear, hasMonth, hasCategoryId });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(budget).values(
				withAuditFieldsForCreate(
					{
						amount: Number(data.get('amount')),
						year: data.get('year')?.toString() || '',
						month: data.get('month')?.toString() || '',
						categoryId: data.get('categoryId')?.toString() || '',
						userId: userId
					},
					userId
				)
			);

			console.log('Created budget entry for user:', userId);
		} catch (error) {
			console.error('Error creating budget entry:', error);
			return fail(500, { error: 'Failed to create budget entry' });
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
		const hasYear = data.has('year');
		const hasMonth = data.has('month');
		const hasCategoryId = data.has('categoryId');

		if (!hasId || !hasAmount || !hasYear || !hasMonth || !hasCategoryId) {
			return fail(400, { hasId, hasAmount, hasYear, hasMonth, hasCategoryId });
		}

		// Update the budget entry in the database
		const budgetId = data.get('id')!.toString();
		try {
			const userId = locals.user.id.toString();

			await db
				.update(budget)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: Number(data.get('amount')),
							year: data.get('year')?.toString() || '',
							month: data.get('month')?.toString() || '',
							categoryId: data.get('categoryId')?.toString()
						},
						userId
					)
				)
				.where(eq(budget.id, budgetId));

			console.log('Updated budget entry:', budgetId);
		} catch (error) {
			console.error('Error updating budget entry:', error);
			return fail(500, { error: 'Failed to update budget entry' });
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

		const budgetId = data.get('id')!.toString();

		try {
			await db.delete(budget).where(eq(budget.id, budgetId));

			console.log('Deleted budget entry:', budgetId);
		} catch (error) {
			console.error('Error deleting budget entry:', error);
			return fail(500, { error: 'Failed to delete budget entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
