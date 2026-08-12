import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiDashboardQuerySchema } from '$lib/server/api/schemas/dashboard';
import { getDashboardSummary } from '$lib/server/dashboard/summary';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'dashboard:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	const parsed = apiDashboardQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const summary = await getDashboardSummary(url);
		return apiSuccess(summary);
	} catch (error) {
		logger.error('API: failed to load dashboard summary', error);
		return apiError('internal_error', 'Failed to load dashboard summary.', 500);
	}
};
