import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiCreateContributionSchema } from '$lib/server/api/schemas/contributions';
import { savingsGoalQueries } from '$lib/server/db/queries';
import { createContribution } from '$lib/server/db/writes/contributions';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, params }) => {
	const auth = await requireApiKey(request, 'contributions:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiCreateContributionSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	const goal = await savingsGoalQueries.findById(params.id);
	if (!goal) {
		return apiError('not_found', 'Savings goal not found.', 404);
	}

	try {
		const created = await createContribution(params.id, parsed.data, auth.userId);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'contributions:write',
			statusCode: 201
		});
		return apiSuccess(created, 201);
	} catch (error) {
		logger.error('API: failed to create contribution', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'contributions:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to create contribution.', 500);
	}
};
