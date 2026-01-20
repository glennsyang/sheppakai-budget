import { fail } from '@sveltejs/kit';
import { and, desc, eq, sql } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { budgetSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { budget, transaction } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { getMonthYearFromUrl, padMonth } from '$lib/utils/dates';

import type { Actions, PageServerLoad } from './$types';

// Helper function to calculate date range for the last 6 months
function getLast6MonthsRange(currentMonth: number, currentYear: number) {
	const months: Array<{ month: string; year: string; date: Date }> = [];

	for (let i = 5; i >= 0; i--) {
		// Calculate target month and year, handling negative months
		let targetMonth = currentMonth - i;
		let targetYear = currentYear;

		// Handle month underflow (going into previous year)
		while (targetMonth <= 0) {
			targetMonth += 12;
			targetYear -= 1;
		}

		// Use UTC to avoid timezone issues during serialization
		const targetDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));

		months.push({
			month: padMonth(targetMonth.toString()),
			year: targetYear.toString(),
			date: targetDate
		});
	}

	return months;
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		return [];
	}

	// Get month and year from URL params or use current month/year
	const { month, year } = getMonthYearFromUrl(url);

	// Calculate date range for last 6 months
	const last6Months = getLast6MonthsRange(month, year);
	const earliestMonth = last6Months[0];
	const latestMonth = last6Months[last6Months.length - 1];

	// Calculate start and end dates for transaction filtering
	const startDate = `${earliestMonth.year}-${earliestMonth.month}-01`;
	const endDate = new Date(Number(latestMonth.year), Number(latestMonth.month), 0);
	const endDateStr = `${latestMonth.year}-${latestMonth.month}-${padMonth(endDate.getDate().toString())}`;

	// Fetch historical budgets for the last 6 months
	const historicalBudgets = await getDb().query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			sql`(${budget.year} || '-' || ${budget.month}) >= ${earliestMonth.year + '-' + earliestMonth.month}`,
			sql`(${budget.year} || '-' || ${budget.month}) <= ${latestMonth.year + '-' + latestMonth.month}`
		),
		orderBy: [budget.year, budget.month]
	});

	// Fetch and aggregate transactions for the last 6 months
	const historicalTransactions = await getDb()
		.select({
			categoryId: transaction.categoryId,
			month: sql<string>`substr(${transaction.date}, 6, 2)`,
			year: sql<string>`substr(${transaction.date}, 1, 4)`,
			total: sql<number>`sum(${transaction.amount})`
		})
		.from(transaction)
		.where(
			and(
				sql`date(${transaction.date}) >= date(${startDate})`,
				sql`date(${transaction.date}) <= date(${endDateStr})`
			)
		)
		.groupBy(transaction.categoryId, sql`substr(${transaction.date}, 1, 7)`)
		.all();

	const form = await superValidate(zod4(budgetSchema));

	return {
		budget: await getDb().query.budget.findMany({
			with: {
				category: true,
				user: true
			},
			where: and(eq(budget.year, year.toString()), eq(budget.month, padMonth(month.toString()))),
			orderBy: [desc(budget.year), desc(budget.month)]
		}),
		historicalBudgets,
		historicalTransactions,
		last6Months,
		categories: await getDb().query.category.findMany(),
		recurring: await getDb().query.recurring.findMany(),
		form
	};
};

export const actions = {
	create: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(budgetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(budget)
				.values(
					withAuditFieldsForCreate(
						{
							amount: form.data.amount,
							year: form.data.year,
							month: form.data.month,
							presetType: form.data.presetType || null,
							categoryId: form.data.categoryId,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('budget created successfully');
		} catch (error) {
			logger.error('Failed to create budget', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create budget. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	}),

	update: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(budgetSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const budgetId = form.data.id!;

		try {
			await getDb()
				.update(budget)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: form.data.amount,
							year: form.data.year,
							month: form.data.month,
							presetType: form.data.presetType || null,
							categoryId: form.data.categoryId
						},
						user
					)
				)
				.where(eq(budget.id, budgetId));

			logger.info('budget updated successfully');
		} catch (error) {
			logger.error('Failed to update budget', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update budget. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, update: true, form };
	}),

	delete: requireAuth(async ({ request }, user) => {
		const data = await request.formData();
		const budgetId = data.get('id')?.toString();

		if (!budgetId) {
			return fail(400, { error: 'Budget ID is required' });
		}

		try {
			await getDb().delete(budget).where(eq(budget.id, budgetId));

			logger.info('budget deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete budget', error);
			return fail(500, { error: 'Failed to delete budget entry' });
		}

		return { success: true, delete: true };
	})
} satisfies Actions;
