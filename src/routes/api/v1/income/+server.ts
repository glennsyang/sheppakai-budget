import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import { apiCreateIncomeSchema, apiIncomeListQuerySchema } from '$lib/server/api/schemas/income';
import { incomeQueries } from '$lib/server/db/queries';
import { createIncome } from '$lib/server/db/writes/income';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'income:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	const parsed = apiIncomeListQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	const { startDate, endDate, month, year, limit } = parsed.data;

	try {
		const entries =
			startDate && endDate
				? await incomeQueries.findByDateRange(startDate, endDate)
				: month && year
					? await incomeQueries.findByMonth(month, year)
					: await incomeQueries.findAll({ limit });

		return apiSuccess(entries);
	} catch (error) {
		logger.error('API: failed to list income', error);
		return apiError('internal_error', 'Failed to load income.', 500);
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'income:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiCreateIncomeSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const created = await createIncome(parsed.data, auth.userId);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'income:write',
			statusCode: 201
		});
		return apiSuccess(created, 201);
	} catch (error) {
		logger.error('API: failed to create income', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'income:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to create income.', 500);
	}
};
