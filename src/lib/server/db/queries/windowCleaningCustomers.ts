import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';

import type { WindowCleaningCustomer } from '$lib/types';

import { getDb } from '../index';
import { windowCleaningCustomer } from '../schema';

import { createQueryBuilder } from './factory';

const baseBuilder = createQueryBuilder<typeof windowCleaningCustomer, WindowCleaningCustomer>({
	tableName: 'windowCleaningCustomer',
	defaultRelations: { user: true },
	defaultOrderBy: [desc(windowCleaningCustomer.name)]
});

export const windowCleaningCustomerQueries = {
	...baseBuilder,

	// Find all active (non-deleted) customers for a user
	findAll: async (userId: string): Promise<WindowCleaningCustomer[]> => {
		return baseBuilder.findAll({
			where: and(
				eq(windowCleaningCustomer.userId, userId),
				isNull(windowCleaningCustomer.deletedAt)
			)
		});
	},

	// Find all soft-deleted customers (admin use)
	findDeleted: async (): Promise<WindowCleaningCustomer[]> => {
		const db = getDb();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (db.query as any).windowCleaningCustomer.findMany({
			where: isNotNull(windowCleaningCustomer.deletedAt),
			with: { user: true },
			orderBy: [desc(windowCleaningCustomer.deletedAt)]
		}) as Promise<WindowCleaningCustomer[]>;
	},

	// Find a single active customer by id
	findById: async (id: string, userId: string): Promise<WindowCleaningCustomer | undefined> => {
		return baseBuilder.findFirst({
			where: and(
				eq(windowCleaningCustomer.id, id),
				eq(windowCleaningCustomer.userId, userId),
				isNull(windowCleaningCustomer.deletedAt)
			)
		});
	}
};
