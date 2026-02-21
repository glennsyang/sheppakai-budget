import { getDb } from '$lib/server/db';
import { recurring } from '$lib/server/db/schema';

export async function runResetRecurringPaid() {
	await getDb().update(recurring).set({ paid: false });
}
