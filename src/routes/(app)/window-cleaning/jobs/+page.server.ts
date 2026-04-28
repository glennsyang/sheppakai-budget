import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { windowCleaningJobSchema } from '$lib/formSchemas/windowCleaning';
import { requireAuth } from '$lib/server/actions/auth-guard';
import { updateAction } from '$lib/server/actions/crud-helpers';
import { getDb } from '$lib/server/db';
import { windowCleaningJobQueries } from '$lib/server/db/queries';
import { windowCleaningJob } from '$lib/server/db/schema';
import { logger } from '$lib/server/logger';
import { formatDateForStorage } from '$lib/utils/dates';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const userId = locals.user!.id;
	const currentYear = new Date().getFullYear();
	const selectedYear = Number(url.searchParams.get('year')) || currentYear;

	const [jobs, jobsLastYear] = await Promise.all([
		windowCleaningJobQueries.findByYear(userId, selectedYear),
		windowCleaningJobQueries.findByYear(userId, selectedYear - 1)
	]);

	const totalCharged = jobs.reduce((sum, j) => sum + j.amountCharged, 0);
	const totalTips = jobs.reduce((sum, j) => sum + j.tip, 0);
	const totalEarned = totalCharged + totalTips;
	const earnedLastYear = jobsLastYear.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

	const jobForm = await superValidate(zod4(windowCleaningJobSchema));

	return {
		jobs,
		totalCharged,
		totalTips,
		totalEarned,
		earnedLastYear,
		jobCount: jobs.length,
		jobForm
	};
};

export const actions = {
	updateJob: updateAction({
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
	}),

	deleteJob: requireAuth(async (event) => {
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
	})
};
