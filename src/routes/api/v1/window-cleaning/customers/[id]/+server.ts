import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiUpdateWindowCleaningCustomerSchema } from '$lib/server/api/schemas/window-cleaning-customers';
import { updateWindowCleaningCustomer } from '$lib/server/db/writes/window-cleaning-customers';
import { logger } from '$lib/server/logger';

import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, url, params }) => {
	const auth = await requireApiKey(request, 'windowCleaningCustomers:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiUpdateWindowCleaningCustomerSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const updated = await updateWindowCleaningCustomer(params.id, parsed.data, auth.userId);
		if (!updated) {
			return apiError('not_found', 'Window cleaning customer not found.', 404);
		}

		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'PATCH',
			path: url.pathname,
			action: 'windowCleaningCustomers:write',
			statusCode: 200
		});
		return apiSuccess(updated);
	} catch (error) {
		logger.error('API: failed to update window cleaning customer', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'PATCH',
			path: url.pathname,
			action: 'windowCleaningCustomers:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to update window cleaning customer.', 500);
	}
};
