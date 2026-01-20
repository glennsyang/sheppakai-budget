import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { categorySchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { category } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { categories: [] };
	}

	const categories = await getDb().query.category.findMany({
		orderBy: [asc(category.name)]
	});

	const form = await superValidate(zod4(categorySchema));

	return { categories, form };
};

export const actions = {
	create: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(category)
				.values(
					withAuditFieldsForCreate(
						{
							name: form.data.name,
							description: form.data.description,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('category created successfully');
		} catch (error) {
			logger.error('Failed to create category', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create category. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	}),

	update: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(categorySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const categoryId = form.data.id!;

		try {
			await getDb()
				.update(category)
				.set(
					withAuditFieldsForUpdate(
						{
							name: form.data.name,
							description: form.data.description
						},
						user
					)
				)
				.where(eq(category.id, categoryId));

			logger.info('Resource updated successfully');
		} catch (error) {
			logger.error('Failed to update category', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update category. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, update: true, form };
	}),

	delete: requireAuth(async ({ request }, user) => {
		const data = await request.formData();
		const hasId = data.has('id');

		if (!hasId) {
			return fail(400, { hasId });
		}

		const categoryId = data.get('id')!.toString();

		try {
			// Check if category is in use before deleting
			const inUse = await getDb().query.transaction.findFirst({
				where: (transaction, { eq }) => eq(transaction.categoryId, categoryId)
			});

			if (inUse) {
				return fail(400, {
					error: 'Cannot delete category that is in use by transactions'
				});
			}

			await getDb().delete(category).where(eq(category.id, categoryId));

			logger.info('Resource deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete category', error);
			return fail(500, { error: 'Failed to delete category' });
		}

		return { success: true, delete: true };
	})
} satisfies Actions;
