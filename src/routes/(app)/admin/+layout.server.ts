import { requireAdmin } from '$lib/server/auth';
import { logger } from '$lib/server/logger';
import { redirect } from '@sveltejs/kit';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	try {
		requireAdmin(locals);
	} catch (error) {
		logger.error('🚫 Non-admin user attempted to access admin layout', error);
		throw redirect(302, '/');
	}

	return {
		user: locals.user
	};
};
