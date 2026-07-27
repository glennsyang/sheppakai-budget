import { registerSchema } from '$lib/formSchemas';
import { handleAuthFormAction } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

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
			return message(
				form,
				{ type: 'error', text: 'Please correct the errors in the form.' },
				{ status: 400 }
			);
		}

		return handleAuthFormAction(
			form,
			async () => {
				await auth.api.signUpEmail({
					body: {
						email: form.data.email,
						password: form.data.password,
						name: form.data.name
					},
					headers: request.headers
				});

				// Redirect to verify-email page with user's email
				throw redirect(302, `/auth/verify-email?email=${encodeURIComponent(form.data.email)}`);
			},
			{
				loggerContext: 'Registration failed',
				fallbackMessage: 'Registration failed. Please try again.',
				buildErrorPayload: (errorMessage) => ({ type: 'error', text: errorMessage }),
				status: 400
			}
		);
	}
} satisfies Actions;
