import { getDb } from '$lib/server/db';
import { savingsGoal } from '$lib/server/db/schema';
import { withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { eq } from 'drizzle-orm';

/** Returns an archived goal to active (admin use). */
export async function unarchiveSavingsGoal(goalId: string, userId: string): Promise<void> {
	await getDb()
		.update(savingsGoal)
		.set(withAuditFieldsForUpdate({ status: 'active' as const }, userId))
		.where(eq(savingsGoal.id, goalId));
}
