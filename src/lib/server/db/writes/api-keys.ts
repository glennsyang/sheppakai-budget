import { and, eq } from 'drizzle-orm';

import { getDb } from '../index';
import { apiKey } from '../schema';

/**
 * Deletes any user's API key by id. `auth.api.deleteApiKey` only deletes keys owned by the
 * calling session, so an admin could never revoke another admin's key through it.
 * Returns whether a key was actually deleted.
 */
export async function deleteApiKeyById(keyId: string): Promise<boolean> {
	const deleted = await getDb()
		.delete(apiKey)
		.where(eq(apiKey.id, keyId))
		.returning({ id: apiKey.id });
	return deleted.length > 0;
}

/**
 * Disables every enabled API key a user owns (on ban or demotion). Disabled rather than
 * deleted so the admin page still shows what the user had; `verifyApiKey` rejects a
 * disabled key, and unbanning or re-promoting the user does not silently revive it.
 * Returns how many keys were disabled.
 */
export async function disableApiKeysForUser(userId: string): Promise<number> {
	const disabled = await getDb()
		.update(apiKey)
		.set({ enabled: false, updatedAt: new Date() })
		.where(and(eq(apiKey.referenceId, userId), eq(apiKey.enabled, true)))
		.returning({ id: apiKey.id });
	return disabled.length;
}
