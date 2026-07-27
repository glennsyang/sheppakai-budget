import { CRON_SECRET } from '$app/env/private';
import { verifyCronAuthorization } from '$lib/server/cron-auth';
import { runResetRecurringPaid } from '$lib/server/jobs/recurring';
import { logger } from '$lib/server/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const authResult = verifyCronAuthorization(request.headers.get('authorization'), CRON_SECRET);

	if (!authResult.authorized) {
		logger.warn('⚠️ Unauthorized cron job attempt', { reason: authResult.reason });
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		logger.info('⏰ Starting cron job for resetting recurring "paid" status!');
		await runResetRecurringPaid();
		logger.info('✅ Reset recurring "paid" status job completed successfully!');
		return json({ success: true, timestamp: new Date().toISOString() });
	} catch (error) {
		logger.error('❌ Reset recurring "paid" status job failed:', { error });
		return json({ error: 'Job failed' }, { status: 500 });
	}
};
