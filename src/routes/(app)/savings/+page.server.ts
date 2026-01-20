import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { savingsSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { getDb } from '$lib/server/db';
import { savings } from '$lib/server/db/schema';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

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

export const actions = {
	create: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(savingsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb()
				.insert(savings)
				.values(
					withAuditFieldsForCreate(
						{
							title: form.data.title,
							description: form.data.description || null,
							amount: form.data.amount,
							userId: user.id.toString()
						},
						user
					)
				);

			logger.info('savings created successfully');
		} catch (error) {
			logger.error('Failed to create savings', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create savings. A database error occurred.' },
				{ status: 400 }
			);
		}

		return { success: true, create: true, form };
	}),

	update: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(savingsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const savingsId = form.data.id!;
		try {
			await getDb()
				.update(savings)
				.set(
					withAuditFieldsForUpdate(
						{
							title: form.data.title,
							description: form.data.description || null,
							amount: form.data.amount
						},
						user
					)
				)
				.where(eq(savings.id, savingsId));

			logger.info('savings updated successfully');
		} catch (error) {
			logger.error('Failed to update savings', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update savings. A database error occurred.' },
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

		const savingsId = data.get('id')!.toString();

		try {
			await getDb().delete(savings).where(eq(savings.id, savingsId));

			logger.info('savings deleted successfully by:', user.id);
		} catch (error) {
			logger.error('Failed to delete savings', error);
			return fail(500, { error: 'Failed to delete savings entry' });
		}

		return { success: true, delete: true };
	})
} satisfies Actions;
