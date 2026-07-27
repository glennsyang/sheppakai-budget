import { handleAuthFormAction } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import type { Actions, PageServerLoad } from './$types';

const resetPasswordSchema = z
	.object({
		password: z.string().min(12, 'Password must be at least 12 characters'),
		confirmPassword: z.string().min(12, 'Password must be at least 12 characters'),
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
	// Redirect if already signed in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(302, '/auth/forgot-password');
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
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
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

				throw redirect(302, '/auth/sign-in?message=Password reset successful! Please sign in.');
			},
			{
				loggerContext: 'Password reset failed',
				fallbackMessage: 'Failed to reset password. Please try again.',
				buildErrorPayload: (errorMessage) => ({ type: 'error', text: errorMessage }),
				status: 400
			}
		);
	}
} satisfies Actions;
