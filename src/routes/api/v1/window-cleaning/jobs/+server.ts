import { recordApiWrite } from '$lib/server/api/audit-log';
import { requireApiKey } from '$lib/server/api/require-api-key';
import { apiError, apiSuccess } from '$lib/server/api/response';
import {
	apiCreateWindowCleaningJobSchema,
	apiWindowCleaningJobListQuerySchema
} from '$lib/server/api/schemas/window-cleaning-jobs';
import { windowCleaningJobQueries } from '$lib/server/db/queries';
import { createWindowCleaningJob } from '$lib/server/db/writes/window-cleaning-jobs';
import { logger } from '$lib/server/logger';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'windowCleaningJobs:read');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	const parsed = apiWindowCleaningJobListQuerySchema.safeParse(
		Object.fromEntries(url.searchParams)
	);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	const { customerId, month, year } = parsed.data;

	try {
		const jobs = customerId
			? await windowCleaningJobQueries.findByCustomer(customerId)
			: month && year
				? await windowCleaningJobQueries.findByMonth(month, year)
				: year
					? await windowCleaningJobQueries.findByYear(year)
					: await windowCleaningJobQueries.findAll();

		return apiSuccess(jobs);
	} catch (error) {
		logger.error('API: failed to list window cleaning jobs', error);
		return apiError('internal_error', 'Failed to load window cleaning jobs.', 500);
	}
};

export const POST: RequestHandler = async ({ request, url }) => {
	const auth = await requireApiKey(request, 'windowCleaningJobs:write');
	if (!auth.ok) return apiError(auth.code, auth.message, auth.status);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return apiError('invalid_json', 'Request body must be valid JSON.', 400);
	}

	const parsed = apiCreateWindowCleaningJobSchema.safeParse(body);
	if (!parsed.success) {
		return apiError('validation_failed', parsed.error.issues.map((i) => i.message).join('; '), 400);
	}

	try {
		const created = await createWindowCleaningJob(parsed.data, auth.userId);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'windowCleaningJobs:write',
			statusCode: 201
		});
		return apiSuccess(created, 201);
	} catch (error) {
		logger.error('API: failed to create window cleaning job', error);
		await recordApiWrite({
			apiKeyId: auth.apiKeyId,
			userId: auth.userId,
			method: 'POST',
			path: url.pathname,
			action: 'windowCleaningJobs:write',
			statusCode: 500
		});
		return apiError('internal_error', 'Failed to create window cleaning job.', 500);
	}
};
