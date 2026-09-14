import { SIGN_IN_ROUTE } from '$lib/auth-routes';
import { categoryQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Redirect to sign-in if not authenticated. Auth pages live in the sibling
	// `(auth)` route group, so they never reach this guard.
	if (!locals.user) {
		throw redirect(302, SIGN_IN_ROUTE);
	}

	try {
		const categories = await categoryQueries.findAll();

		return {
			user: locals.user,
			categories
		};
	} catch (error) {
		logger.error('Failed to load categories:', error);
		return {
			user: locals.user,
			categories: [],
			loadError: 'Failed to load categories. Please try refreshing the page.'
		};
	}
};
