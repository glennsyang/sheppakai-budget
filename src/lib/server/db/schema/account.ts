import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import { generateId } from '../utils';

import user from './user';

const account = sqliteTable('account', {
	id: text('id').primaryKey().$defaultFn(generateId),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
	refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
	scope: text('scope'),
	idToken: text('id_token'),
	password: text('password'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export default account;
