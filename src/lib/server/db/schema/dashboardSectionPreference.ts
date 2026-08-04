import { relations, sql } from 'drizzle-orm';
import { sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';
import user from './user';

const dashboardSectionPreference = sqliteTable(
	'dashboard_section_preference',
	{
		id: text('id').primaryKey().$defaultFn(generateId),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		// Presence of a row means this section is hidden for this user (opt-out model),
		// so sections added later default to visible with no backfill needed.
		sectionKey: text('section_key').notNull(),
		createdAt: text('created_at')
			.notNull()
			.default(sql`(current_timestamp)`),
		updatedAt: text('updated_at')
			.notNull()
			.default(sql`(current_timestamp)`)
	},
	(table) => [
		uniqueIndex('dashboard_section_preference_user_section_idx').on(table.userId, table.sectionKey)
	]
);

export const dashboardSectionPreferenceRelations = relations(
	dashboardSectionPreference,
	({ one }) => ({
		user: one(user, { fields: [dashboardSectionPreference.userId], references: [user.id] })
	})
);

export default dashboardSectionPreference;
