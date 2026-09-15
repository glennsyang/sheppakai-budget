import { getDb } from '$lib/server/db';
import { incomeQueries } from '$lib/server/db/queries';
import { income } from '$lib/server/db/schema';
import type { Income } from '$lib/types';
import { formatDateForStorage } from '$lib/utils/dates';

export type CreateIncomeInput = {
	name: string;
	description: string;
	date: string;
	amount: number;
};

/**
 * Insert path for API-key-driven income creation. Mirrors
 * `src/lib/server/db/writes/transactions.ts` — a narrow write path kept separate from
 * the generic `createCrudActions` form-action helper the UI uses, so an API change can't
 * regress the UI's own create flow.
 */
export async function createIncome(input: CreateIncomeInput, userId: string): Promise<Income> {
	const [inserted] = await getDb()
		.insert(income)
		.values({
			name: input.name,
			description: input.description,
			date: formatDateForStorage(input.date),
			amount: input.amount,
			userId,
			createdBy: userId,
			updatedBy: userId
		})
		.returning();

	const withRelations = await incomeQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch income ${inserted.id} after creation`);
	}
	return withRelations;
}
