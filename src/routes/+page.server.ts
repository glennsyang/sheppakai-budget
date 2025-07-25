import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect based on authentication status
	if (locals.user) {
		throw redirect(302, '/dashboard');
	} else {
		throw redirect(302, '/auth/sign-in');
	}
};
