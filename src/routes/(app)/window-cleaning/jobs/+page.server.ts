import { windowCleaningJobSchema } from '$lib/formSchemas';
import { deleteJob, updateJob } from '$lib/server/actions/window-cleaning-jobs';
import { windowCleaningJobQueries } from '$lib/server/db/queries';
import { logger } from '$lib/server/logger';
import { getCurrentPacificMonthYear, parseYearParam } from '$lib/utils/dates';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const selectedYear = parseYearParam(
		url.searchParams.get('year'),
		getCurrentPacificMonthYear().year
	);

	const jobForm = await superValidate(zod4(windowCleaningJobSchema));

	try {
		const [jobs, jobsLastYear] = await Promise.all([
			windowCleaningJobQueries.findByYear(selectedYear),
			windowCleaningJobQueries.findByYear(selectedYear - 1)
		]);

		const totalCharged = jobs.reduce((sum, j) => sum + j.amountCharged, 0);
		const totalTips = jobs.reduce((sum, j) => sum + j.tip, 0);
		const totalEarned = totalCharged + totalTips;
		const earnedLastYear = jobsLastYear.reduce((sum, j) => sum + j.amountCharged + j.tip, 0);

		return {
			jobs,
			totalCharged,
			totalTips,
			totalEarned,
			earnedLastYear,
			jobCount: jobs.length,
			jobForm
		};
	} catch (error) {
		logger.error('Failed to load window cleaning jobs:', error);
		return {
			jobs: [],
			totalCharged: 0,
			totalTips: 0,
			totalEarned: 0,
			earnedLastYear: 0,
			jobCount: 0,
			loadError: 'Failed to load window cleaning jobs. Please try refreshing the page.',
			jobForm
		};
	}
};

export const actions = {
	updateJob,
	deleteJob
} satisfies Actions;
