import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { income, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
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

		return json({ income: userIncome });
	} catch (error) {
		console.error('Error fetching income:', error);
		return json({ error: 'Failed to fetch income' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { amount, description, date } = await request.json();

		if (!amount || !date) {
			return json({ error: 'Amount and date are required' }, { status: 400 });
		}

		if (typeof amount !== 'number' || amount <= 0) {
			return json({ error: 'Amount must be a positive number' }, { status: 400 });
		}

		const [newIncome] = await db
			.insert(income)
			.values({
				user_id: locals.user.id,
				amount: amount,
				description: description || null,
				date: date,
				created_at: new Date().toISOString(),
				created_by: locals.user.id,
				updated_at: new Date().toISOString(),
				updated_by: locals.user.id
			})
			.returning();

		return json({ income: newIncome }, { status: 201 });
	} catch (error) {
		console.error('Error creating income:', error);
		return json({ error: 'Failed to create income' }, { status: 500 });
	}
};
