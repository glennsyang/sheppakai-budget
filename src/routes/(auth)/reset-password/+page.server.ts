import { FORGOT_PASSWORD_ROUTE, SIGN_IN_ROUTE } from '$lib/auth-routes';
import { passwordSchema } from '$lib/formSchemas';
import { handleAuthFormAction, invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { redirectIfAuthenticated } from '$lib/server/auth/form-helpers';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import type { Actions, PageServerLoad } from './$types';

const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema,
		// Hidden field for token
		token: z.string().optional()
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: 'custom',
				message: "Passwords don't match",
				path: ['password']
			});
			ctx.addIssue({
				code: 'custom',
				message: "Passwords don't match",
				path: ['confirmPassword']
			});
		}
	});

export const load: PageServerLoad = async ({ locals, url }) => {
	redirectIfAuthenticated(locals.user);
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(302, FORGOT_PASSWORD_ROUTE);
	}

	const form = await superValidate(zod4(resetPasswordSchema));

	return {
		token,
		form
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(resetPasswordSchema));

		if (!form.data.token || !form.valid) {
			return invalidAuthForm(form);
		}

		return handleAuthFormAction(
			form,
			async () => {
				await auth.api.resetPassword({
					body: {
						token: form.data.token,
						newPassword: form.data.password
					}
				});

				// Whitelisted flag only — the sign-in page renders a fixed confirmation
				// banner for ?reset=success; no message text is reflected through the URL.
				throw redirect(302, `${SIGN_IN_ROUTE}?reset=success`);
			},
			{
				loggerContext: 'Password reset failed',
				fallbackMessage: 'Failed to reset password. Please try again.'
			}
		);
	}
} satisfies Actions;
