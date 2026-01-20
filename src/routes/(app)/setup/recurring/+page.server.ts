import { asc } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { recurringSchema } from '$lib/formSchemas/finances';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { recurring } from '$lib/server/db/schema';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	const recurrings = await getDb().query.recurring.findMany({
		with: {
			user: true
		},
		orderBy: [asc(recurring.merchant)]
	});

	const form = await superValidate(zod4(recurringSchema));

	return { recurrings, form };
};

export const actions = createCrudActions({
	schema: recurringSchema,
	table: recurring,
	entityName: 'Recurring expense',
	transformCreate: (data, userId) => ({
		amount: Number(data.amount),
		description: data.description,
		merchant: data.merchant,
		cadence: data.cadence,
		userId
	}),
	transformUpdate: (data) => ({
		amount: data.amount,
		description: data.description,
		merchant: data.merchant,
		cadence: data.cadence
	})
});
