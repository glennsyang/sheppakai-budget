import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { z } from 'zod';
import { authenticate } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

const signInSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already signed in
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}

	const form = await superValidate(zod(signInSchema));

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
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, zod(signInSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const user = await authenticate(form.data.email, form.data.password);

			if (!user) {
				return fail(400, {
					form: {
						...form,
						message: 'Invalid email or password'
					}
				});
			}

			// Set session cookie
			const sessionData = {
				userId: user.id,
				email: user.email
			};

			cookies.set('session', JSON.stringify(sessionData), {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 7 // 1 week
			});

			throw redirect(302, '/dashboard');
		} catch (error) {
			// Don't catch redirects as errors - re-throw them
			if (isRedirect(error)) {
				throw error;
			}

			console.error('Sign-in error:', error);
			return fail(500, {
				form: {
					...form,
					message: 'An error occurred during sign-in. Please try again.'
				}
			});
		}
	}
} satisfies Actions;
