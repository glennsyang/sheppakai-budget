import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { category } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { withAuditFieldsForCreate } from '$lib/server/db/utils';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const allCategories = await getDb().select().from(category);

		return json(allCategories);
	} catch (error) {
		console.error('Error fetching categories:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const userId = locals.user.id.toString();

	try {
		const { name, description } = await request.json();

		if (!name || name.trim() === '') {
			return new Response('Category name is required', { status: 400 });
		}

		const newCategory = await getDb()
			.insert(category)
			.values(
				withAuditFieldsForCreate(
					{
						name: name.trim(),
						description: description?.trim() || null
					},
					userId
				)
			)
			.returning();

		return json(newCategory[0]);
	} catch (error) {
		console.error('Error creating category:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
};
