import { unArchiveSchema } from '$lib/formSchemas';
import { adminAuthFailure } from '$lib/server/actions/admin-guard';
import { invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { getDb } from '$lib/server/db';
import { savingsGoal } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(unArchiveSchema));

	const db = getDb();

	try {
		// Query archived savings goals with user information
		const archivedGoals = await db.query.savingsGoal.findMany({
			where: eq(savingsGoal.status, 'archived'),
			with: {
				user: true
			}
		});

		return {
			archivedGoals,
			form
		};
	} catch (error) {
		logger.error('Failed to load archived goals:', error);
		return {
			archivedGoals: [],
			loadError: 'Failed to load archived goals. Please try refreshing the page.',
			form
		};
	}
};

export const actions: Actions = {
	unarchive: async ({ request, locals }) => {
		// superValidate runs before the guard so the guard has a form to attach its message to.
		const form = await superValidate(request, zod4(unArchiveSchema));

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
			// Update the goal status to 'active'
			await db
				.update(savingsGoal)
				.set(
					withAuditFieldsForUpdate(
						{
							status: 'active'
						},
						locals.user
					)
				)
				.where(eq(savingsGoal.id, form.data.goalId));

			logger.info(`Goal with ID ${form.data.goalId} updated successfully`);
			return message(form, { type: 'success', text: 'Goal unarchived successfully' });
		} catch (error) {
			logger.error('Failed to unarchive goal:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to unarchive goal'
				},
				{ status: 500 }
			);
		}
	}
};
