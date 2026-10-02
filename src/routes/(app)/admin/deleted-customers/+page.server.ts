import { restoreCustomerSchema } from '$lib/formSchemas';
import { adminFormAction } from '$lib/server/actions/admin-guard';
import { assertAdmin } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { windowCleaningCustomerQueries } from '$lib/server/db/queries';
import { windowCleaningCustomer } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	assertAdmin(locals);

	const form = await superValidate(zod4(restoreCustomerSchema));

	try {
		const deletedCustomers = await windowCleaningCustomerQueries.findDeleted();

		return { deletedCustomers, form };
	} catch (error) {
		logger.error('Failed to load deleted customers', error);
		return {
			deletedCustomers: [],
			loadError: 'Failed to load deleted customers. Please try refreshing the page.',
			form
		};
	}
};

export const actions: Actions = {
	restore: adminFormAction(restoreCustomerSchema, async (_event, form, user) => {
		const db = getDb();

		try {
			await db
				.update(windowCleaningCustomer)
				.set(
					withAuditFieldsForUpdate(
						{
							deletedAt: null,
							deletedBy: null
						},
						user
					)
				)
				.where(eq(windowCleaningCustomer.id, form.data.customerId));

			logger.info(`Customer restored: ${form.data.customerId}`);
			return message(form, { type: 'success', text: 'Customer restored successfully' });
		} catch (error) {
			logger.error('Failed to restore customer', error);
			return message(form, { type: 'error', text: 'Failed to restore customer' }, { status: 500 });
		}
	})
};
