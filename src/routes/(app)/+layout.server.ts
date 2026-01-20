import { redirect } from '@sveltejs/kit';

import { categoryQueries } from '$lib/server/db/queries';

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
		throw redirect(302, '/auth/sign-in');
	}

	return {
		user: locals.user,
		categories: await categoryQueries.findAll()
	};
};
