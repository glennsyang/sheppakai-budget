import { db } from '$lib/server/db';
import { categories, expenses, income, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	const allIncome = await db
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
		.where(eq(income.user_id, locals.user.id.toString()));

	const allExpenses = await db
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
		.where(eq(expenses.user_id, locals.user.id.toString()));

	// Calculate totals
	const totalExpenses = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
	const totalIncome = allIncome.reduce((sum, inc) => sum + inc.amount, 0);

	return {
		expenses: allExpenses,
		income: allIncome,
		totalExpenses,
		totalIncome
	};
};
