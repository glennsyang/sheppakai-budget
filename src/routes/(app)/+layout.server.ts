import { redirect } from '@sveltejs/kit';

import type { Category } from '$lib';
import { getDb } from '$lib/server/db';

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
		categories: (await getDb().query.category.findMany()) as Category[]
	};
};
