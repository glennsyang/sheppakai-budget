import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { recurringSchema } from '$lib/formSchemas/finances';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { recurring } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

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

export const actions = {
	create: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(recurringSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(recurring)
				.values(
					withAuditFieldsForCreate(
						{
							amount: Number(form.data.amount),
							description: form.data.description,
							merchant: form.data.merchant,
							cadence: form.data.cadence,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('recurring created successfully');
		} catch (error) {
			logger.error('Failed to create recurring', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create recurring expense. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	}),

	update: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(recurringSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const recurringId = form.data.id!;

		try {
			await getDb()
				.update(recurring)
				.set(
					withAuditFieldsForUpdate(
						{
							amount: form.data.amount,
							description: form.data.description,
							merchant: form.data.merchant,
							cadence: form.data.cadence
						},
						user
					)
				)
				.where(eq(recurring.id, recurringId));

			logger.info('recurring updated successfully');
		} catch (error) {
			logger.error('Failed to update recurring', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update recurring expense. A database error occurred.' },
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

		const recurringId = data.get('id')!.toString();

		try {
			await getDb().delete(recurring).where(eq(recurring.id, recurringId));

			logger.info('recurring deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete recurring', error);
			return fail(500, { error: 'Failed to delete recurring entry' });
		}

		return { success: true, update: true };
	})
} satisfies Actions;
