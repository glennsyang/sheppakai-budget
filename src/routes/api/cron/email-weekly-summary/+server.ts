import { type RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { runWeeklySummaryEmail } from '$lib/server/jobs/weeklySummaryEmail';
import { logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ request }) => {
	const authHeader = request.headers.get('authorization');
	const expectedToken = process.env.CRON_SECRET;

	if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
		logger.warn('⚠️ Unauthorized cron job attempt');
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
