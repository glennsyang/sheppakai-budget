import { asc } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { savingsSchema } from '$lib/formSchemas';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { savings } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

import type { Savings } from '$lib';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { savings: [] };
	}

	const allSavings: Savings[] = (await getDb().query.savings.findMany({
		with: {
			user: true
		},
		orderBy: [asc(savings.title)]
	})) as Savings[];

	const form = await superValidate(zod4(savingsSchema));

	return {
		savings: allSavings,
		form
	};
};

export const actions = createCrudActions({
	schema: savingsSchema,
	table: savings,
	entityName: 'Savings',
	transformCreate: (data, userId) => ({
		title: data.title,
		description: data.description || null,
		amount: data.amount,
		userId
	}),
	transformUpdate: (data) => ({
		title: data.title,
		description: data.description || null,
		amount: data.amount
	})
});
