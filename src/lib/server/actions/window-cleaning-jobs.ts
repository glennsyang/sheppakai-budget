import { windowCleaningJobSchema } from '$lib/formSchemas';
import { windowCleaningJob } from '$lib/server/db/schema';
import { toWindowCleaningJobRow } from '$lib/server/db/writes/window-cleaning-jobs';

import { deleteAction, updateAction } from './crud-helpers';

export const updateJob = updateAction({
	schema: windowCleaningJobSchema,
	table: windowCleaningJob,
	entityName: 'Job',
	transformUpdate: (data) => toWindowCleaningJobRow(data)
});

export const deleteJob = deleteAction({
	table: windowCleaningJob,
	entityName: 'Job'
});
