import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { expenses, categories, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
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

		return json({ expenses: userExpenses });
	} catch (error) {
		console.error('Error fetching expenses:', error);
		return json({ error: 'Failed to fetch expenses' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { amount, description, date, categoryId } = await request.json();

		if (!amount || !date) {
			return json({ error: 'Amount and date are required' }, { status: 400 });
		}

		if (typeof amount !== 'number' || amount <= 0) {
			return json({ error: 'Amount must be a positive number' }, { status: 400 });
		}

		const [newExpense] = await db
			.insert(expenses)
			.values({
				user_id: locals.user.id,
				category_id: categoryId || null,
				amount: amount,
				description: description || null,
				date: date,
				created_at: new Date().toISOString(),
				created_by: locals.user.id,
				updated_at: new Date().toISOString(),
				updated_by: locals.user.id
			})
			.returning();

		return json({ expense: newExpense }, { status: 201 });
	} catch (error) {
		console.error('Error creating expense:', error);
		return json({ error: 'Failed to create expense' }, { status: 500 });
	}
};
