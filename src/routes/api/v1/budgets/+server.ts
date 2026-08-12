import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiBudgetsQuerySchema } from '$lib/server/api/schemas/budgets';
import { budgetQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'budgets:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	const parsed = apiBudgetsQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	const { month, year } = parsed.data;
	if (year === undefined) {
		return apiError('validation_failed', 'year is required', 400);
	}

	try {
		const budgets = month
			? await budgetQueries.findByMonthYear(month, year)
			: await budgetQueries.findByYear(year);
		return apiSuccess(budgets);
	} catch (error) {
		logger.error('API: failed to list budgets', error);
		return apiError('internal_error', 'Failed to load budgets.', 500);
	}
};
