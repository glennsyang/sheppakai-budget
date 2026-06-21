import { windowCleaningJobSchema } from '$lib/formSchemas';
import { getDb } from '$lib/server/db';
import { windowCleaningJob } from '$lib/server/db/schema';
import { logger } from '$lib/server/logger';
import { formatDateForStorage } from '$lib/utils/dates';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { requireAuth } from './auth-guard';
import { updateAction } from './crud-helpers';

export const updateJob = updateAction({
	schema: windowCleaningJobSchema,
	table: windowCleaningJob,
	entityName: 'Job',
	transformUpdate: (data) => ({
		customerId: data.customerId,
		jobDate: formatDateForStorage(data.jobDate),
		jobTime: data.jobTime || null,
		amountCharged: data.amountCharged,
		tip: data.tip ?? 0,
		durationHours: data.durationHours ?? null,
		notes: data.notes || null
	})
});

export const deleteJob = requireAuth(async (event) => {
	const data = await event.request.formData();
	const id = data.get('id') as string | null;

	if (!id) {
		return fail(400, { error: 'Job ID is required' });
	}

	try {
		await getDb().delete(windowCleaningJob).where(eq(windowCleaningJob.id, id));
		logger.info(`Job deleted: ${id}`);
		return { success: true, delete: true };
	} catch (error) {
		logger.error('Failed to delete job', error);
		return fail(500, { error: 'Failed to delete job' });
	}
});
