import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { recurringSchema } from '$lib/formSchemas/finances';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { recurringQueries } from '$lib/server/db/queries';
import { recurring } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return [];
	}

	const recurrings = await recurringQueries.findAll({
		where: eq(recurring.userId, locals.user.id)
	});

	const form = await superValidate(zod4(recurringSchema));

	return { recurrings, form };
};

export const actions = {
	...createCrudActions({
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
	}),
	togglePaid: requireAuth(async ({ request }, user) => {
		const formData = await request.formData();
		const recurringId = formData.get('id')?.toString();
		const currentPaid = formData.get('paid')?.toString() === 'true';

		if (!recurringId) {
			return fail(400, { error: 'Recurring ID is required' });
		}

		await getDb()
			.update(recurring)
			.set(withAuditFieldsForUpdate({ paid: !currentPaid }, user))
			.where(and(eq(recurring.id, recurringId), eq(recurring.userId, user.id.toString())));

		return { success: true };
	})
};
