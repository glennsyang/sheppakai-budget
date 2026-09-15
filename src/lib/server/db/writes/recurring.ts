import { getDb } from '$lib/server/db';
import { recurringQueries } from '$lib/server/db/queries';
import { recurring } from '$lib/server/db/schema';
import type { Recurring } from '$lib/types';
import { getCurrentUTCTimestamp } from '$lib/utils/dates';
import { eq } from 'drizzle-orm';

/**
 * Update path for API-key-driven paid/unpaid toggling, gated by the narrower
 * `recurring:markPaid` scope rather than a general `recurring:write` scope. Mirrors the
 * UI's `togglePaid` action in `src/routes/(app)/recurring/+page.server.ts`, without
 * granting the API broader update access to other fields on a recurring entry.
 */
export async function markRecurringPaid(
	id: string,
	paid: boolean,
	userId: string
): Promise<Recurring | undefined> {
	await getDb()
		.update(recurring)
		.set({ paid, updatedBy: userId, updatedAt: getCurrentUTCTimestamp() })
		.where(eq(recurring.id, id));

	return recurringQueries.findById(id);
}
