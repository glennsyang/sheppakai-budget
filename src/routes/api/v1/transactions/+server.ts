import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import {
	apiCreateTransactionSchema,
	apiTransactionListQuerySchema
} from '$lib/server/api/schemas/transactions';
import { transactionQueries } from '$lib/server/db/queries';
import { createTransaction } from '$lib/server/db/writes/transactions';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'transactions:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	const parsed = apiTransactionListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	const { startDate, endDate, categoryId, limit } = parsed.data;

	try {
		const transactions =
			startDate && endDate && categoryId
				? await transactionQueries.findByCategory(categoryId, { start: startDate, end: endDate })
				: startDate && endDate
					? await transactionQueries.findByDateRange(startDate, endDate)
					: categoryId
						? await transactionQueries.findByCategory(categoryId)
						: await transactionQueries.findAll({ limit });

		return apiSuccess(transactions);
	} catch (error) {
		logger.error('API: failed to list transactions', error);
		return apiError('internal_error', 'Failed to load transactions.', 500);
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'transactions:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiCreateTransactionSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const created = await createTransaction(parsed.data, auth.userId);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'transactions:write',
			statusCode: 201
		});
		return apiSuccess(created, 201);
	} catch (error) {
		logger.error('API: failed to create transaction', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'transactions:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to create transaction.', 500);
	}
};
