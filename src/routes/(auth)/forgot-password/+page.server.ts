import { RESET_PASSWORD_ROUTE } from '$lib/auth-routes';
import { handleAuthFormAction, invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { FORGOT_PASSWORD_RESPONSE } from '$lib/server/auth/forgot-password-response';
import { createAuthLoadForm, redirectIfAuthenticated } from '$lib/server/auth/form-helpers';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import type { Actions, PageServerLoad } from './$types';

const forgotSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	redirectIfAuthenticated(locals.user);
	const form = await createAuthLoadForm(forgotSchema, url);

	return { form };
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
				await auth.api.requestPasswordReset({
					body: { email: form.data.email, redirectTo: RESET_PASSWORD_ROUTE },
					headers: request.headers
				});

				// Don't reveal if the email exists or not for security reasons
				return message(form, FORGOT_PASSWORD_RESPONSE);
			},
			{
				loggerContext: 'Password reset request failed',
				fallbackMessage: FORGOT_PASSWORD_RESPONSE.text,
				// Same text *and* same styling as the success path, so the banner cannot
				// be used to probe whether an account exists.
				errorType: FORGOT_PASSWORD_RESPONSE.type
			}
		);
	}
} satisfies Actions;
