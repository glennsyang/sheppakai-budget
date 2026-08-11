import { SIGN_IN_ROUTE } from '$lib/server/auth-guard-load';
import { accountQueries, categoryQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { isPasswordExpired } from '$lib/server/password-policy';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Don't redirect auth routes
	if (url.pathname.startsWith('/auth')) {
		return {
			user: locals.user || null
		};
	}

	// Redirect to sign-in if not authenticated for other routes
	if (!locals.user) {
		throw redirect(302, SIGN_IN_ROUTE);
	}

	// Force password rotation once expired, until the user updates it on /profile
	if (!url.pathname.startsWith('/profile')) {
		const account = await accountQueries.findByUserId(locals.user.id);
		if (isPasswordExpired(account?.updatedAt)) {
			throw redirect(302, '/profile?passwordExpired=true');
		}
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
