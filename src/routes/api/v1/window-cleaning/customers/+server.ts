import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiCreateWindowCleaningCustomerSchema } from '$lib/server/api/schemas/window-cleaning-customers';
import { windowCleaningCustomerQueries } from '$lib/server/db/queries';
import { createWindowCleaningCustomer } from '$lib/server/db/writes/window-cleaning-customers';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const auth = await requireApiKey(request, 'windowCleaningCustomers:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	try {
		const customers = await windowCleaningCustomerQueries.findAll();
		return apiSuccess(customers);
	} catch (error) {
		logger.error('API: failed to list window cleaning customers', error);
		return apiError('internal_error', 'Failed to load window cleaning customers.', 500);
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'windowCleaningCustomers:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiCreateWindowCleaningCustomerSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const created = await createWindowCleaningCustomer(parsed.data, auth.userId);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'windowCleaningCustomers:write',
			statusCode: 201
		});
		return apiSuccess(created, 201);
	} catch (error) {
		logger.error('API: failed to create window cleaning customer', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'windowCleaningCustomers:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to create window cleaning customer.', 500);
	}
};
