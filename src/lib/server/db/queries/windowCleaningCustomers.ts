import type { WindowCleaningCustomer } from '$lib/types';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';

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

	// Find all active (non-deleted) customers
	findAll: async (): Promise<WindowCleaningCustomer[]> => {
		return baseBuilder.findAll({
			where: isNull(windowCleaningCustomer.deletedAt)
		});
	},

	// Find all soft-deleted customers (admin use)
	findDeleted: async (): Promise<WindowCleaningCustomer[]> => {
		const db = getDb();
		return db.query.windowCleaningCustomer.findMany({
			where: isNotNull(windowCleaningCustomer.deletedAt),
			with: { user: true },
			orderBy: [desc(windowCleaningCustomer.deletedAt)]
		}) as Promise<WindowCleaningCustomer[]>;
	},

	// Find a single active customer by id
	findById: async (id: string): Promise<WindowCleaningCustomer | undefined> => {
		return baseBuilder.findFirst({
			where: and(eq(windowCleaningCustomer.id, id), isNull(windowCleaningCustomer.deletedAt))
		});
	}
};
