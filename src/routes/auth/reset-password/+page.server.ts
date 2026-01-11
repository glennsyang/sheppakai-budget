import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { auth } from '$lib/server/auth';
import { getBetterAuthErrorMessage } from '$lib/utils';

import type { Actions, PageServerLoad } from './$types';

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
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
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.resetPassword({
				body: {
					token: form.data.token,
					newPassword: form.data.password
				}
			});

			throw redirect(302, '/auth/sign-in?message=Password reset successful! Please sign in.');
		} catch (error) {
			// Don't catch redirects as errors - re-throw them
			if (isRedirect(error)) {
				throw error;
			}

			console.error('Reset password error:', error);
			// Get user-friendly error message from better-auth error
			const errorMessage = getBetterAuthErrorMessage(
				error,
				'Failed to reset password. Please try again.'
			);

			return fail(400, {
				form: {
					...form,
					message: errorMessage
				}
			});
		}
	}
} satisfies Actions;
