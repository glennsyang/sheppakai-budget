import type { InferSelectModel } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import { account } from '../schema';
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
