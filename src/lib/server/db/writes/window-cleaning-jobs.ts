import { getDb } from '$lib/server/db';
import { windowCleaningJobQueries } from '$lib/server/db/queries';
import { windowCleaningJob } from '$lib/server/db/schema';
import type { WindowCleaningJob } from '$lib/types';
import { formatDateForStorage } from '$lib/utils/dates';

export type CreateWindowCleaningJobInput = {
	customerId: string;
	jobDate: string;
	jobTime?: string;
	amountCharged: number;
	tip: number;
	durationHours?: number;
	notes?: string;
};

/** Mirrors the `createJob` action field mapping in `src/routes/(app)/window-cleaning/+page.server.ts`. */
export async function createWindowCleaningJob(
	input: CreateWindowCleaningJobInput,
	userId: string
): Promise<WindowCleaningJob> {
	const [inserted] = await getDb()
		.insert(windowCleaningJob)
		.values({
			customerId: input.customerId,
			jobDate: formatDateForStorage(input.jobDate),
			jobTime: input.jobTime || null,
			amountCharged: input.amountCharged,
			tip: input.tip,
			durationHours: input.durationHours ?? null,
			notes: input.notes || null,
			userId,
			createdBy: userId,
			updatedBy: userId
		})
		.returning();

	const withRelations = await windowCleaningJobQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch window cleaning job ${inserted.id} after creation`);
	}
	return withRelations;
}
