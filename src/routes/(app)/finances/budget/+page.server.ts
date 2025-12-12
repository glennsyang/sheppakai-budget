import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/server/db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { budget, transaction } from '$lib/server/db/schema';

// Helper function to calculate date range for the last 6 months
function getLast6MonthsRange(currentMonth: number, currentYear: number) {
	const months: Array<{ month: string; year: string; date: Date }> = [];

	for (let i = 5; i >= 0; i--) {
		const targetDate = new Date(currentYear, currentMonth - 1 - i, 1);
		const targetMonth = targetDate.getMonth() + 1;
		const targetYear = targetDate.getFullYear();

		months.push({
			month: targetMonth.toString().padStart(2, '0'),
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
		year = Number.parseInt(yearParam);
		month = Number.parseInt(monthParam);
	}

	// Calculate date range for last 6 months
	const last6Months = getLast6MonthsRange(month, year);
	const earliestMonth = last6Months[0];
	const latestMonth = last6Months[last6Months.length - 1];

	// Calculate start and end dates for transaction filtering
	const startDate = `${earliestMonth.year}-${earliestMonth.month}-01`;
	const endDate = new Date(Number(latestMonth.year), Number(latestMonth.month), 0);
	const endDateStr = `${latestMonth.year}-${latestMonth.month}-${endDate.getDate().toString().padStart(2, '0')}`;

	// Fetch historical budgets for the last 6 months
	const historicalBudgets = await getDb().query.budget.findMany({
		with: {
			category: true,
			user: true
		},
		where: and(
			eq(budget.userId, locals.user.id),
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
				eq(transaction.userId, locals.user.id),
				sql`date(${transaction.date}) >= date(${startDate})`,
				sql`date(${transaction.date}) <= date(${endDateStr})`
			)
		)
		.groupBy(transaction.categoryId, sql`substr(${transaction.date}, 1, 7)`)
		.all();

	return {
		budget: await getDb().query.budget.findMany({
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
		historicalBudgets,
		historicalTransactions,
		last6Months,
		categories: await getDb().query.category.findMany(),
		recurring: await getDb().query.recurring.findMany()
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

			await getDb()
				.insert(budget)
				.values(
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

			await getDb()
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
			await getDb().delete(budget).where(eq(budget.id, budgetId));

			console.log('Deleted budget entry:', budgetId);
		} catch (error) {
			console.error('Error deleting budget entry:', error);
			return fail(500, { error: 'Failed to delete budget entry' });
		}

		return { success: true, update: true };
	}
} satisfies Actions;
