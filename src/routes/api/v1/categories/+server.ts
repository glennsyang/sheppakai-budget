import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { categoryQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const auth = await requireApiKey(request, 'categories:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	try {
		const categories = await categoryQueries.findAll();
		return apiSuccess(categories);
	} catch (error) {
		logger.error('API: failed to list categories', error);
		return apiError('internal_error', 'Failed to load categories.', 500);
	}
};
