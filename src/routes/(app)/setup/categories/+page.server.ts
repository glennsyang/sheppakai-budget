import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { categorySchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { categoryQueries, transactionQueries } from '$lib/server/db/queries';
import { category } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { categories: [] };
	}

	const categories = await categoryQueries.findAll();

	const form = await superValidate(zod4(categorySchema));

	return { categories, form };
};

export const actions = createCrudActions({
	schema: categorySchema,
	table: category,
	entityName: 'Category',
	beforeDelete: async (id, _userId) => {
		// Check if category is in use before deleting
		const inUse = await transactionQueries.findFirst({
			where: (transaction, { eq }) => eq(transaction.categoryId, id)
		});

		if (inUse) {
			return { error: 'Cannot delete category that is in use by transactions' };
		}
	}
});
