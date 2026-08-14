import { getDb } from '$lib/server/db';
import { apiKey } from '$lib/server/db/schema';
import { logger } from '$lib/server/logger';
import { inArray } from 'drizzle-orm';

import type { PageServerLoad } from './$types';
import type { AdminApiLogEntry } from './columns';

export const load: PageServerLoad = async () => {
	const db = getDb();

	try {
		const auditEntries = await db.query.apiAuditLog.findMany({
			with: { user: true },
			orderBy: (table, { desc }) => [desc(table.createdAt)]
		});

		// apiKeyId has no FK to apiKey.id (by design, so the trail survives key revocation), so
		// resolve names via a separate lookup rather than a join, and tolerate ids with no match.
		const apiKeyIds = [...new Set(auditEntries.map((entry) => entry.apiKeyId))];
		const apiKeys =
			apiKeyIds.length > 0
				? await db
						.select({ id: apiKey.id, name: apiKey.name })
						.from(apiKey)
						.where(inArray(apiKey.id, apiKeyIds))
				: [];
		const apiKeyNamesById = new Map(apiKeys.map((key) => [key.id, key.name]));

		const entries: AdminApiLogEntry[] = auditEntries.map((entry) => ({
			...entry,
			apiKeyName: apiKeyNamesById.get(entry.apiKeyId) ?? null,
			apiKeyExists: apiKeyNamesById.has(entry.apiKeyId)
		}));

		return { entries };
	} catch (error) {
		logger.error('Failed to load API audit log', error);
		return {
			entries: [],
			loadError: 'Failed to load API logs. Please try refreshing the page.'
		};
	}
};
