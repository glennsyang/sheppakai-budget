import { CRON_SECRET } from '$app/env/private';
import { verifyCronAuthorization } from '$lib/server/cron-auth';
import { runWeeklySummaryEmail } from '$lib/server/jobs/weeklySummaryEmail';
import { logger } from '$lib/server/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const authResult = verifyCronAuthorization(request.headers.get('authorization'), CRON_SECRET);

	if (!authResult.authorized) {
		logger.warn('⚠️ Unauthorized cron job attempt', { reason: authResult.reason });
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		logger.info('⏰ Starting cron job for sending weekly summary email');
		const result = await runWeeklySummaryEmail();
		logger.info('✅ Weekly summary email job completed successfully!');
		return json({ success: true, timestamp: new Date().toISOString(), result });
	} catch (error) {
		logger.error('❌ Weekly summary email job failed:', { error });
		return json({ error: 'Job failed' }, { status: 500 });
	}
};
