import { recurringSchema, togglePaidSchema } from '$lib/formSchemas/finances';
import { getUser, requireAuth } from '$lib/server/actions/auth-guard';
import { createCrudActions } from '$lib/server/actions/crud-helpers';
import { recurringQueries } from '$lib/server/db/queries';
import { recurring } from '$lib/server/db/schema';
import { markRecurringPaid } from '$lib/server/db/writes/recurring';
import { logger } from '$lib/server/logger';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = getUser(locals);
	const recurrings = await recurringQueries.findAll({
		where: eq(recurring.userId, user.id)
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
			amount: data.amount,
			description: data.description,
			merchant: data.merchant,
			cadence: data.cadence,
			dueDay: data.dueDay ?? null,
			dueMonth: data.dueMonth ?? null,
			userId
		}),
		transformUpdate: (data) => ({
			amount: data.amount,
			description: data.description,
			merchant: data.merchant,
			cadence: data.cadence,
			dueDay: data.dueDay ?? null,
			dueMonth: data.dueMonth ?? null
		})
	}),
	togglePaid: requireAuth(async ({ request }, user) => {
		const form = await superValidate(request, zod4(togglePaidSchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form' },
				{ status: 400 }
			);
		}

		try {
			await markRecurringPaid(form.data.id, form.data.paid, user.id);
			logger.info(`Toggled paid status for recurring expense ${form.data.id} to ${form.data.paid}`);
			return message(form, { type: 'success', text: 'Paid status updated' });
		} catch (error) {
			logger.error('Failed to toggle recurring paid status', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to toggle paid status. Please try again.' },
				{ status: 500 }
			);
		}
	})
} satisfies Actions;
