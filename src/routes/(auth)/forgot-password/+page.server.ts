import { POST_LOGIN_ROUTE, RESET_PASSWORD_ROUTE } from '$lib/auth-routes';
import { handleAuthFormAction, invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { formMessageFromUrl } from '$lib/server/actions/form-message';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
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
		throw redirect(302, POST_LOGIN_ROUTE);
	}

	const form = await superValidate(zod4(forgotSchema));

	// Check for a message handed over by a redirect
	form.message = formMessageFromUrl(url);

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(forgotSchema));

		if (!form.valid) {
			return invalidAuthForm(form);
		}

		return handleAuthFormAction(
			form,
			async () => {
				// Route through Better Auth's HTTP handler rather than calling
				// auth.api.requestPasswordReset directly, so the configured per-IP rate
				// limit protects this public, email-sending action too (a direct api call
				// bypasses the rate-limit middleware). Mirrors the verify-email resend
				// action. `redirectTo` is a relative path, which passes Better Auth's
				// origin check; buildResetUrl resolves it against BETTER_AUTH_BASE_URL.
				const headers = new Headers(request.headers);
				headers.set('content-type', 'application/json');
				headers.delete('content-length');

				const response = await auth.handler(
					new Request(new URL('/api/auth/request-password-reset', request.url), {
						method: 'POST',
						headers,
						body: JSON.stringify({ email: form.data.email, redirectTo: RESET_PASSWORD_ROUTE })
					})
				);
				if (!response.ok) {
					throw new Error(`Password reset request failed with status ${response.status}`);
				}

				// Don't reveal if the email exists or not for security reasons
				return message(form, {
					type: 'success',
					text: 'If an account exists with that email, you will receive a password reset link.'
				});
			},
			{
				loggerContext: 'Password reset request failed',
				fallbackMessage:
					'If an account exists with that email, you will receive a password reset link.',
				// Same text *and* same styling as the success path, so the banner cannot
				// be used to probe whether an account exists.
				errorType: 'success'
			}
		);
	}
} satisfies Actions;
