import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import db from '$lib/server/db';
import type { Category } from '$lib';

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
		categories: (await db.query.category.findMany()) as Category[]
	};
};
