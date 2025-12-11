import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { asc, eq } from 'drizzle-orm';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { category } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { categories: [] };
	}

	const categories = await db.query.category.findMany({
		orderBy: [asc(category.name)]
	});

	return { categories };
};

export const actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const hasName = data.has('name');
		const hasDescription = data.has('description');

		if (!hasName || !hasDescription) {
			return fail(400, { hasName, hasDescription });
		}

		try {
			const userId = locals.user.id.toString();

			await db.insert(category).values(
				withAuditFieldsForCreate(
					{
						name: data.get('name')?.toString() || '',
						description: data.get('description')?.toString() || '',
						userId: userId
					},
					userId
				)
			);

			console.log('Created category for user:', userId);
		} catch (error) {
			console.error('Error creating category:', error);
			return fail(500, { error: 'Failed to create category' });
		}

		return { success: true, create: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();

		const hasId = data.has('id');
		const hasName = data.has('name');
		const hasDescription = data.has('description');

		if (!hasId || !hasName || !hasDescription) {
			return fail(400, { hasId, hasName, hasDescription });
		}

		const categoryId = data.get('id')!.toString();

		try {
			const userId = locals.user.id.toString();

			await db
				.update(category)
				.set(
					withAuditFieldsForUpdate(
						{
							name: data.get('name')?.toString() || '',
							description: data.get('description')?.toString() || ''
						},
						userId
					)
				)
				.where(eq(category.id, categoryId));

			console.log('Updated category:', categoryId);
		} catch (error) {
			console.error('Error updating category:', error);
			return fail(500, { error: 'Failed to update category' });
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

		const categoryId = data.get('id')!.toString();

		try {
			// Check if category is in use before deleting
			const inUse = await db.query.transaction.findFirst({
				where: (transaction, { eq }) => eq(transaction.categoryId, categoryId)
			});

			if (inUse) {
				return fail(400, {
					error: 'Cannot delete category that is in use by transactions'
				});
			}

			await db.delete(category).where(eq(category.id, categoryId));

			console.log('Deleted category:', categoryId);
		} catch (error) {
			console.error('Error deleting category:', error);
			return fail(500, { error: 'Failed to delete category' });
		}

		return { success: true, delete: true };
	}
} satisfies Actions;
