import { getDb } from '$lib/server/db';
import { recurringQueries } from '$lib/server/db/queries';
import { recurring } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import type { Recurring } from '$lib/types';
import { eq } from 'drizzle-orm';

/**
 * Update path for API-key-driven paid/unpaid toggling, gated by the narrower
 * `recurring:markPaid` scope rather than a general `recurring:write` scope — the API
 * counterpart of the UI's `togglePaid` action, without granting the API broader update
 * access to other fields on a recurring entry.
 */
export async function markRecurringPaid(
	id: string,
	paid: boolean,
	userId: string
): Promise<Recurring | undefined> {
	await getDb()
		.update(recurring)
		.set(withAuditFieldsForUpdate({ paid }, userId))
		.where(eq(recurring.id, id));

	return recurringQueries.findById(id);
}
