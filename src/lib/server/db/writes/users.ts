import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function updateUserName(userId: string, name: string): Promise<void> {
	await getDb().update(user).set({ name }).where(eq(user.id, userId));
}
