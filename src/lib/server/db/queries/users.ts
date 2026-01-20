import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import type { User } from '$lib/types';

import { account, user } from '../schema';

import { createQueryBuilder } from './factory';

type Account = InferSelectModel<typeof account>;

const baseBuilder = createQueryBuilder<typeof user, User>({
	tableName: 'user'
});

export const userQueries = {
	...baseBuilder,

	// Find user with all relations
	findWithRelations: async (userId: string) => {
		return baseBuilder.findFirst({
			where: eq(user.id, userId),
			with: {
				accounts: true,
				sessions: true
			}
		});
	}
};

const accountBuilder = createQueryBuilder<typeof account, Account>({
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
