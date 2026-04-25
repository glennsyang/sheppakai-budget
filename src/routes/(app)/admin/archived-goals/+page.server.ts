import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { unArchiveSchema } from '$lib/formSchemas';
import { requireAdmin } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { savingsGoal } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

function adminAuthFailure(locals: App.Locals) {
	try {
		requireAdmin(locals);
		return null;
	} catch {
		return fail(locals.user ? 403 : 401, {
			error: locals.user ? 'Forbidden' : 'Unauthorized'
		});
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod4(unArchiveSchema));

	if (!locals.user) {
		return { archivedGoals: [], form };
	}

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
			form
		};
	}
};

export const actions: Actions = {
	unarchive: async ({ request, locals }) => {
		const authFailure = adminAuthFailure(locals);
		if (authFailure) {
			return authFailure;
		}

		const form = await superValidate(request, zod4(unArchiveSchema));
		if (!form.valid) {
			return fail(400, { form });
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
						locals.user!
					)
				)
				.where(eq(savingsGoal.id, form.data.goalId));

			logger.info(`Goal with ID ${form.data.goalId} updated successfully`);
			return { success: true, form };
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
