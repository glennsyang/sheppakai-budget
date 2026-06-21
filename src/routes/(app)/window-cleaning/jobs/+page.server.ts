import { windowCleaningJobSchema } from '$lib/formSchemas';
import { deleteJob, updateJob } from '$lib/server/actions/window-cleaning-jobs';
import { windowCleaningJobQueries } from '$lib/server/db/queries';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const currentYear = new Date().getFullYear();
	const yearParam = url.searchParams.get('year');
	const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : Number.NaN;
	const selectedYear =
		Number.isSafeInteger(parsedYear) && parsedYear >= 1900 && parsedYear <= 9999
			? parsedYear
			: currentYear;

	const [jobs, jobsLastYear] = await Promise.all([
		windowCleaningJobQueries.findByYear(selectedYear),
		windowCleaningJobQueries.findByYear(selectedYear - 1)
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
	updateJob,
	deleteJob
} satisfies Actions;
