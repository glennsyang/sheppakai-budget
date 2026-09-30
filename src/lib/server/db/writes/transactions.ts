import { getDb } from '$lib/server/db';
import { transactionQueries } from '$lib/server/db/queries';
import { transaction } from '$lib/server/db/schema';
import { withAuditFieldsForCreate } from '$lib/server/db/utils';
import { evaluateCreatedTransactionBudgetAlert } from '$lib/server/notifications/budget-threshold-alerts';
import type { Transaction } from '$lib/types';
import { formatDateForStorage } from '$lib/utils/dates';

export type CreateTransactionInput = {
	amount: number;
	payee: string;
	notes: string;
	date: string;
	gstAmount?: number;
	excludedFromBudget: boolean;
	categoryId: string;
};

/** Input → row mapping shared by the UI form actions and the API write path. */
export function toTransactionRow(input: CreateTransactionInput) {
	return {
		amount: input.amount,
		gstAmount: input.gstAmount ?? null,
		payee: input.payee,
		notes: input.notes,
		date: formatDateForStorage(input.date),
		excludedFromBudget: input.excludedFromBudget,
		categoryId: input.categoryId
	};
}

/**
 * Insert path for API-key-driven transaction creation. Deliberately separate from the
 * generic `createCreateAction` factory in `src/lib/server/actions/crud-helpers.ts` so this
 * narrower write path can't regress the form-action UI. Runs the same budget-threshold-alert
 * hook, so an API-created transaction behaves the same as a UI-created one.
 */
export async function createTransaction(
	input: CreateTransactionInput,
	userId: string
): Promise<Transaction> {
	const [inserted] = await getDb()
		.insert(transaction)
		.values(withAuditFieldsForCreate({ ...toTransactionRow(input), userId }, userId))
		.returning();

	await evaluateCreatedTransactionBudgetAlert(inserted);

	const withRelations = await transactionQueries.findById(inserted.id);
	if (!withRelations) {
		throw new Error(`Failed to re-fetch transaction ${inserted.id} after creation`);
	}
	return withRelations;
}
