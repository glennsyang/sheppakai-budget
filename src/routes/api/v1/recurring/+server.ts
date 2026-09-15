import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { recurringQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const auth = await requireApiKey(request, 'recurring:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	try {
		const recurrings = await recurringQueries.findAll();
		return apiSuccess(recurrings);
	} catch (error) {
		logger.error('API: failed to list recurring expenses', error);
		return apiError('internal_error', 'Failed to load recurring expenses.', 500);
	}
};
