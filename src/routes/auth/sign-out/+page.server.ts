import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear the session cookie
		cookies.delete('session', { path: '/' });

		// Redirect to sign-in page
		throw redirect(302, '/auth/sign-in');
	}
} satisfies Actions;
