import { getDb } from '$lib/server/db';
import { contributionQueries } from '$lib/server/db/queries';
import { contribution } from '$lib/server/db/schema';
import { withAuditFieldsForCreate } from '$lib/server/db/utils';
import type { Contribution } from '$lib/types';
import { formatDateForStorage } from '$lib/utils/dates';

export type CreateContributionInput = {
	amount: number;
	date: string;
	description?: string;
};

/** Input → row mapping shared by the UI form actions and the API write path. */
export function toContributionRow(goalId: string, input: CreateContributionInput) {
	return {
		goalId,
		amount: input.amount,
		date: formatDateForStorage(input.date),
		description: input.description || null
	};
}

export async function createContribution(
	goalId: string,
	input: CreateContributionInput,
	userId: string
): Promise<Contribution> {
	const [inserted] = await getDb()
		.insert(contribution)
		.values(withAuditFieldsForCreate({ ...toContributionRow(goalId, input), userId }, userId))
		.returning();

	const withRelations = await contributionQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch contribution ${inserted.id} after creation`);
	}
	return withRelations;
}
