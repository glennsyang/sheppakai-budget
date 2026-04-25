import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { changePasswordSchema, updateProfileSchema } from '$lib/formSchemas';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { auth } from '$lib/server/auth';
import { getDb } from '$lib/server/db';
import { accountQueries, userQueries } from '$lib/server/db/queries';
import { user } from '$lib/server/db/schema';
import { sendPasswordChangedEmail } from '$lib/server/email';
import { logger } from '$lib/server/logger';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user!;

	// Get the full user data including updatedAt
	const fullUserData = await userQueries.findById(currentUser.id);

	// Get the account data to find when password was last updated
	const accountData = await accountQueries.findByUserId(currentUser.id);

	// Initialize profile form with current user data
	const profileForm = await superValidate(
		{ name: fullUserData?.name || '' },
		zod4(updateProfileSchema)
	);
	const passwordForm = await superValidate(zod4(changePasswordSchema));

	return {
		user: fullUserData || currentUser,
		profileForm,
		passwordForm,
		passwordUpdatedAt: accountData?.updatedAt || null
	};
};

export const actions = {
	update: requireAuth(async ({ request }, currentUser) => {
		const form = await superValidate(request, zod4(updateProfileSchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
		}

		try {
			await getDb().update(user).set({ name: form.data.name }).where(eq(user.id, currentUser.id));

			logger.info('User profile updated successfully');
			return message(form, { type: 'success', text: 'Profile updated successfully.' });
		} catch (error) {
			logger.error('Failed to update user profile', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to update profile. Please try again.' },
				{ status: 500 }
			);
		}
	}),

	changePassword: requireAuth(async ({ request }, currentUser) => {
		const form = await superValidate(request, zod4(changePasswordSchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
		}

		try {
			const ipAddressHeader =
				request.headers.get('x-forwarded-for') ||
				request.headers.get('x-real-ip') ||
				request.headers.get('x-client-ip');
			const ipAddress = ipAddressHeader?.split(',')[0]?.trim() || undefined;
			const userAgent = request.headers.get('user-agent') || undefined;

			await auth.api.changePassword({
				body: {
					currentPassword: form.data.currentPassword,
					newPassword: form.data.newPassword,
					revokeOtherSessions: true
				},
				headers: request.headers
			});

			logger.info('Security event: password changed and other sessions revoked', {
				userId: currentUser.id,
				email: currentUser.email,
				ipAddress,
				userAgent,
				timestamp: new Date().toISOString()
			});

			sendPasswordChangedEmail({
				to: currentUser.email,
				name: currentUser.name || currentUser.email,
				changedAt: new Date(),
				ipAddress,
				userAgent,
				source: 'Profile settings'
			}).catch((error: unknown) => {
				logger.error('Failed to send password changed notification email', error);
			});

			return message(form, {
				type: 'success',
				text: `Password changed successfully for user ${currentUser.name}.`
			});
		} catch (error) {
			logger.error('Failed to change password', error);
			return message(
				form,
				{ type: 'error', text: 'Current password is incorrect or password change failed.' },
				{ status: 400 }
			);
		}
	})
} satisfies Actions;
