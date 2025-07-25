import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const userCategories = await db.select().from(categories);

		return json(userCategories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const { name, description } = await request.json();

		if (!name || name.trim() === '') {
			return new Response('Category name is required', { status: 400 });
		}

		const newCategory = await db
			.insert(categories)
			.values({
				name: name.trim(),
				description: description?.trim() || null,
				user_id: locals.user.id,
				created_at: new Date().toISOString(),
				created_by: locals.user.id,
				updated_at: new Date().toISOString(),
				updated_by: locals.user.id
			})
			.returning();

		return json(newCategory[0]);
	} catch (error) {
		console.error('Error creating category:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
