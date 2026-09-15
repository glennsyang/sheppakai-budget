import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiMarkRecurringPaidSchema } from '$lib/server/api/schemas/recurring';
import { markRecurringPaid } from '$lib/server/db/writes/recurring';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, url, params }) => {
	const auth = await requireApiKey(request, 'recurring:markPaid');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiMarkRecurringPaidSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const updated = await markRecurringPaid(params.id, parsed.data.paid, auth.userId);
		if (!updated) {
			return apiError('not_found', 'Recurring expense not found.', 404);
		}

		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'PATCH',
			path: url.pathname,
			action: 'recurring:markPaid',
			statusCode: 200
		});
		return apiSuccess(updated);
	} catch (error) {
		logger.error('API: failed to mark recurring expense paid status', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'PATCH',
			path: url.pathname,
			action: 'recurring:markPaid',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to update recurring expense.', 500);
	}
};
