import { fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { changePasswordSchema, updateProfileSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { auth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { account, user } from '$lib/server/db/schema';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null,
			profileForm: await superValidate(zod4(updateProfileSchema)),
			passwordForm: await superValidate(zod4(changePasswordSchema)),
			passwordUpdatedAt: null
		};
	}

	// Get the full user data including updatedAt
	const fullUserData = await getDb().query.user.findFirst({
		where: eq(user.id, locals.user.id)
	});

	// Get the account data to find when password was last updated
	const accountData = await getDb().query.account.findFirst({
		where: and(eq(account.userId, locals.user.id), eq(account.providerId, 'credential'))
	});

	// Initialize profile form with current user data
	const profileForm = await superValidate(
		{ name: fullUserData?.name || '' },
		zod4(updateProfileSchema)
	);
	const passwordForm = await superValidate(zod4(changePasswordSchema));

	return {
		user: fullUserData || locals.user,
		profileForm,
		passwordForm,
		passwordUpdatedAt: accountData?.updatedAt || fullUserData?.updatedAt || null
	};
};

export const actions = {
	update: requireAuth(async ({ request }, currentUser) => {
		const form = await superValidate(request, zod4(updateProfileSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await getDb().update(user).set({ name: form.data.name }).where(eq(user.id, currentUser.id));

			logger.info('User profile updated successfully');
			return {
				form: {
					...form,
					message: 'Profile updated successfully'
				}
			};
		} catch (error) {
			logger.error('Failed to update user profile', error);
			return fail(500, {
				form: {
					...form,
					message: 'Failed to update profile'
				}
			});
		}
	}),

	changePassword: requireAuth(async ({ request }, currentUser) => {
		const form = await superValidate(request, zod4(changePasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await auth.api.changePassword({
				body: {
					currentPassword: form.data.currentPassword,
					newPassword: form.data.newPassword,
					revokeOtherSessions: false
				},
				headers: request.headers
			});

			return {
				form: {
					...form,
					message: `Password changed successfully for user ${currentUser.name}.`
				}
			};
		} catch (error) {
			logger.error('Failed to change password', error);
			return fail(400, {
				form: {
					...form,
					message: 'Current password is incorrect or password change failed'
				}
			});
		}
	})
} satisfies Actions;
