import { getDb } from '$lib/server/db';
import { recurringQueries } from '$lib/server/db/queries';
import { recurring } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import type { Recurring } from '$lib/types';
import { eq } from 'drizzle-orm';

/**
 * The single write path for paid/unpaid toggling, shared by the UI's `togglePaid` action and
 * the API. The API gates it behind the narrower `recurring:markPaid` scope rather than a
 * general `recurring:write` scope, so it never gets broader update access to other fields.
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
