import { windowCleaningJobSchema } from '$lib/formSchemas';
import { windowCleaningJob } from '$lib/server/db/schema';
import { formatDateForStorage } from '$lib/utils/dates';

import { deleteAction, updateAction } from './crud-helpers';

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

export const deleteJob = deleteAction({
	table: windowCleaningJob,
	entityName: 'Job'
});
