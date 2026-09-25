import { desc, eq } from 'drizzle-orm';

import { getDb } from '../index';
import { apiKey, user } from '../schema';

type ApiKeyWithOwner = {
	id: string;
	name: string | null;
	start: string | null;
	enabled: boolean;
	permissions: Record<string, string[]> | null;
	expiresAt: Date | null;
	createdAt: Date;
	lastRequest: Date | null;
	ownerId: string;
	ownerName: string;
	ownerEmail: string;
};

/** The plugin stores `permissions` as a JSON string; a malformed value shows as "no scopes". */
export function parsePermissions(raw: string | null): Record<string, string[]> | null {
	if (!raw) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		return parsed && typeof parsed === 'object' ? (parsed as Record<string, string[]>) : null;
	} catch {
		return null;
	}
}

export const apiKeyQueries = {
	/**
	 * Every API key across all users, newest first, with its owner. Queried directly rather
	 * than via `auth.api.listApiKeys`, which only ever returns the calling session's own keys
	 * — an admin needs to see (and revoke) keys belonging to other admins too. The hashed
	 * `key` column is deliberately not selected.
	 */
	listAllWithOwner: async (): Promise<ApiKeyWithOwner[]> => {
		const rows = await getDb()
			.select({
				id: apiKey.id,
				name: apiKey.name,
				start: apiKey.start,
				enabled: apiKey.enabled,
				permissions: apiKey.permissions,
				expiresAt: apiKey.expiresAt,
				createdAt: apiKey.createdAt,
				lastRequest: apiKey.lastRequest,
				ownerId: user.id,
				ownerName: user.name,
				ownerEmail: user.email
			})
			.from(apiKey)
			.innerJoin(user, eq(apiKey.referenceId, user.id))
			.orderBy(desc(apiKey.createdAt));

		return rows.map((row) => ({ ...row, permissions: parsePermissions(row.permissions) }));
	}
};
