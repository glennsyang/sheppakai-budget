import { eq } from 'drizzle-orm';

import { getDb } from '../index';
import { dashboardSectionPreference } from '../schema';

export const dashboardPreferenceQueries = {
	findHiddenKeysByUserId: async (userId: string): Promise<string[]> => {
		const rows = await getDb()
			.select({ sectionKey: dashboardSectionPreference.sectionKey })
			.from(dashboardSectionPreference)
			.where(eq(dashboardSectionPreference.userId, userId));

		return rows.map((row) => row.sectionKey);
	},

	// Replaces the full hidden-section set for a user in one go (delete-all-then-insert) —
	// simpler and just as correct as a per-key upsert since the client always submits the
	// complete set of currently-hidden keys.
	setHiddenKeys: async (userId: string, sectionKeys: string[]): Promise<void> => {
		const db = getDb();

		db.transaction((tx) => {
			tx.delete(dashboardSectionPreference)
				.where(eq(dashboardSectionPreference.userId, userId))
				.run();

			if (sectionKeys.length > 0) {
				tx.insert(dashboardSectionPreference)
					.values(sectionKeys.map((sectionKey) => ({ userId, sectionKey })))
					.run();
			}
		});
	}
};
