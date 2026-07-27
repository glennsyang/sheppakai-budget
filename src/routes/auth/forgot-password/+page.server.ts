import { BETTER_AUTH_BASE_URL } from '$app/env/private';
import { handleAuthFormAction } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import type { Actions, PageServerLoad } from './$types';

const forgotSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already signed in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	const form = await superValidate(zod4(forgotSchema));

	// Check for success message from registration
	const message = url.searchParams.get('message');
	if (message) {
		form.message = message;
	}

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(forgotSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		return handleAuthFormAction(
			form,
			async () => {
				const redirectTo = `${BETTER_AUTH_BASE_URL}/auth/reset-password`;

				await auth.api.requestPasswordReset({
					body: {
						email: form.data.email,
						redirectTo
					}
				});

				// Don't reveal if the email exists or not for security reasons
				return message(
					form,
					'If an account exists with that email, you will receive a password reset link.'
				);
			},
			{
				loggerContext: 'Password reset request failed',
				fallbackMessage:
					'If an account exists with that email, you will receive a password reset link.',
				buildErrorPayload: (errorMessage) => errorMessage
			}
		);
	}
} satisfies Actions;
