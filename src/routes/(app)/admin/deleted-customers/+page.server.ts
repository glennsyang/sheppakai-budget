import { restoreCustomerSchema } from '$lib/formSchemas';
import { adminAuthFailure } from '$lib/server/actions/admin-guard';
import { invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { requireAdmin } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { windowCleaningCustomer } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireAdmin(locals);

	const form = await superValidate(zod4(restoreCustomerSchema));

	const db = getDb();

	try {
		const deletedCustomers = await db.query.windowCleaningCustomer.findMany({
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			where: (table: any, { isNotNull }: any) => isNotNull(table.deletedAt),
			with: { user: true },
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			orderBy: (table: any, { desc }: any) => [desc(table.deletedAt)]
		});

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
	restore: async ({ request, locals }) => {
		// superValidate runs before the guard so the guard has a form to attach its message to.
		const form = await superValidate(request, zod4(restoreCustomerSchema));

		// The `!locals.user` arm is unreachable — adminAuthFailure already rejects anonymous
		// callers — but it narrows the type for the audit fields below.
		const authFailure = adminAuthFailure(locals, form);
		if (authFailure || !locals.user) {
			return authFailure ?? message(form, { type: 'error', text: 'Unauthorized' }, { status: 401 });
		}

		if (!form.valid) {
			return invalidAuthForm(form);
		}

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
						locals.user
					)
				)
				.where(eq(windowCleaningCustomer.id, form.data.customerId));

			logger.info(`Customer restored: ${form.data.customerId}`);
			return message(form, { type: 'success', text: 'Customer restored successfully' });
		} catch (error) {
			logger.error('Failed to restore customer', error);
			return message(form, { type: 'error', text: 'Failed to restore customer' }, { status: 500 });
		}
	}
};
