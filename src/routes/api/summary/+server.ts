import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { expenses, income, categories, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// Fetch user's expenses with category names
		const userExpenses = await db
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
			.leftJoin(categories, eq(expenses.category_id, categories.id))
			.leftJoin(users, eq(expenses.user_id, users.id))
			.where(eq(expenses.user_id, locals.user.id));

		// Fetch user's income
		const userIncome = await db
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
			.leftJoin(users, eq(income.user_id, users.id))
			.where(eq(income.user_id, locals.user.id));

		// Calculate totals
		const totalExpenses = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
		const totalIncome = userIncome.reduce((sum, inc) => sum + inc.amount, 0);

		return json({
			expenses: userExpenses,
			income: userIncome,
			totalExpenses,
			totalIncome
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
