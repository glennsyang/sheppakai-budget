import type { InferSelectModel } from 'drizzle-orm';
import { desc, eq, inArray } from 'drizzle-orm';

import { getDb } from '../index';
import { account, session } from '../schema';
import { createQueryBuilder } from './factory';

type Account = InferSelectModel<typeof account>;

const baseBuilder = createQueryBuilder({
	tableName: 'user'
});

export const userQueries = baseBuilder;

const accountBuilder = createQueryBuilder({
	tableName: 'account'
});

export const accountQueries = {
	...accountBuilder,

	// Find account by user ID
	findByUserId: async (userId: string): Promise<Account | undefined> => {
		return accountBuilder.findFirst({
			where: eq(account.userId, userId)
		});
	}
};

export const sessionQueries = {
	/**
	 * Session summaries for the given users, newest first, in a single query. Replaces one
	 * `auth.api.listUserSessions` call per user on the admin users page. The `token` column is
	 * deliberately not selected: a session token is a bearer credential and the page only
	 * shows when and where each session was created.
	 */
	findSummariesByUserIds: async (userIds: string[]) => {
		if (userIds.length === 0) {
			return [];
		}

		return getDb()
			.select({
				id: session.id,
				userId: session.userId,
				createdAt: session.createdAt,
				expiresAt: session.expiresAt,
				ipAddress: session.ipAddress,
				userAgent: session.userAgent,
				impersonatedBy: session.impersonatedBy
			})
			.from(session)
			.where(inArray(session.userId, userIds))
			.orderBy(desc(session.createdAt));
	}
};
