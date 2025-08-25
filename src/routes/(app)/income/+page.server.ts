import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { income } from '$lib/server/db/schema';

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

	const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
	const endDate = new Date(year, month, 0).toISOString().split('T')[0];

	return {
		income: await db.query.income.findMany({
			with: {
				user: true
			},
			where: and(
				sql`date(${income.date}) >= date(${startDate})`,
				sql`date(${income.date}) <= date(${endDate})`
			),
			orderBy: [desc(income.date)]
		})
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

		if (!hasAmount || !hasDescription || !hasDate) {
			return fail(400, { hasAmount, hasDescription, hasDate });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(income).values(
				withAuditFieldsForCreate(
					{
						amount: Number(data.get('amount')),
						description: data.get('description')?.toString() || '',
						date: data.get('date')?.toString() || '',
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
