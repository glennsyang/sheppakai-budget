import { categorySchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { transactionQueries } from '$lib/server/db/queries';
import { category } from '$lib/server/db/schema';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

// Categories themselves come from the (app) layout load; only the form is page-specific.
export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(categorySchema));

	return { form };
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
}) satisfies Actions;
