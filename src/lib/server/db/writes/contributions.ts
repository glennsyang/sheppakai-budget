import { getDb } from '$lib/server/db';
import { contributionQueries } from '$lib/server/db/queries';
import { contribution } from '$lib/server/db/schema';
import type { Contribution } from '$lib/types';
import { formatDateForStorage } from '$lib/utils/dates';

export type CreateContributionInput = {
	amount: number;
	date: string;
	description?: string;
};

/** Mirrors the `createContribution` action field mapping in `src/routes/(app)/savings/goals/+page.server.ts`. */
export async function createContribution(
	goalId: string,
	input: CreateContributionInput,
	userId: string
): Promise<Contribution> {
	const [inserted] = await getDb()
		.insert(contribution)
		.values({
			goalId,
			amount: input.amount,
			date: formatDateForStorage(input.date),
			description: input.description || null,
			userId,
			createdBy: userId,
			updatedBy: userId
		})
		.returning();

	const withRelations = await contributionQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch contribution ${inserted.id} after creation`);
	}
	return withRelations;
}
