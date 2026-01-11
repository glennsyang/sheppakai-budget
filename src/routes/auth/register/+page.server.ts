import { fail, isRedirect, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import { auth } from '$lib/server/auth';
import { getBetterAuthErrorMessage } from '$lib/utils';

import type { Actions, PageServerLoad } from './$types';

const registerSchema = z
	.object({
		email: z.email('Please enter a valid email address'),
		name: z
			.string()
			.min(5, 'Name must be at least 5 characters')
			.max(100, 'Name must be at most 100 characters'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already signed in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	const form = await superValidate(zod4(registerSchema));

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
		const form = await superValidate(request, zod4(registerSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.signUpEmail({
				body: {
					email: form.data.email,
					password: form.data.password,
					name: form.data.name
				}
			});

			throw redirect(302, '/auth/sign-in?message=Registration successful! Please sign in.');
		} catch (error) {
			// Don't catch redirects as errors - re-throw them
			if (isRedirect(error)) {
				throw error;
			}

			console.error('Registration error:', error);
			// Get user-friendly error message from better-auth error
			const errorMessage = getBetterAuthErrorMessage(
				error,
				'Registration failed. Please try again.'
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
