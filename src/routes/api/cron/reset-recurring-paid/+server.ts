import { type RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { runResetRecurringPaid } from '$lib/server/jobs/recurring';
import { logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const expectedToken = process.env.CRON_SECRET;

	if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
		logger.warn('⚠️ Unauthorized cron job attempt');
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
