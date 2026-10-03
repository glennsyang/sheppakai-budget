import { SIGN_IN_ROUTE } from '$lib/auth-routes';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/server/logger';
import { redirect } from '@sveltejs/kit';

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		// Sign-out always lands on sign-in: if Better Auth fails to revoke the session, log it
		// rather than surfacing a 500 the user can't act on.
		try {
			await auth.api.signOut({
				headers: request.headers
			});
		} catch (error) {
			logger.error('Sign-out failed', error);
		}

		throw redirect(302, SIGN_IN_ROUTE);
	}
} satisfies Actions;
