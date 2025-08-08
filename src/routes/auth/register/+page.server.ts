import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { z } from 'zod';
import { register } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const registerSchema = z
	.object({
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect if already signed in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	return {
		form: await superValidate(zod(registerSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await register(form.data.email, form.data.password);

			// After successful registration, redirect to sign-in
			throw redirect(302, '/auth/sign-in?message=Registration successful! Please sign in.');
		} catch (error) {
			// Don't catch redirects as errors - re-throw them
			if (isRedirect(error)) {
				throw error;
			}

			console.error('Registration error:', error);
			const errorMessage =
				error instanceof Error ? error.message : 'An error occurred during registration.';

			return fail(400, {
				form: {
					...form,
					message: errorMessage
				}
			});
		}
	}
} satisfies Actions;
