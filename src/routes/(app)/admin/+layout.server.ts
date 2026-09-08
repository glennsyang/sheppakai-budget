import { assertAdmin } from '$lib/server/auth';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Throws error(401) when unauthenticated, error(403) when not an admin — same guard
	// shape as synapse / sheppakai-mealplanner (sheppakai-budget#437).
	assertAdmin(locals);

	return {
		user: locals.user
	};
};
