import type { SQL } from 'drizzle-orm';

import { getDb } from '../index';

export interface QueryBuilderConfig<_TTable> {
	tableName: string;
	defaultRelations?: Record<string, boolean>;
	defaultOrderBy?: SQL[];
}

export function createQueryBuilder<_TTable, TReturn = _TTable>(
	config: QueryBuilderConfig<_TTable>
) {
	return {
		// Find all with optional filters
		findAll: async (options?: {
			where?: SQL;
			orderBy?: SQL[];
			with?: Record<string, boolean>;
		}): Promise<TReturn[]> => {
			const db = getDb();
			// Type assertion needed due to dynamic table name access
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (db.query as any)[config.tableName].findMany({
				with: options?.with ?? config.defaultRelations,
				where: options?.where,
				orderBy: options?.orderBy ?? config.defaultOrderBy
			}) as Promise<TReturn[]>;
		},

		// Find by ID with relations
		findById: async (id: string, withRelations = true): Promise<TReturn | undefined> => {
			const db = getDb();
			// Type assertion needed due to dynamic table name access
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (db.query as any)[config.tableName].findFirst({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				where: (table: any, { eq }: any) => eq(table.id, id),
				with: withRelations ? config.defaultRelations : undefined
			}) as Promise<TReturn | undefined>;
		},

		// Find first matching a condition
		findFirst: async (options?: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			where?: SQL | ((fields: any, ops: any) => SQL);
			with?: Record<string, boolean>;
		}): Promise<TReturn | undefined> => {
			const db = getDb();
			// Type assertion needed due to dynamic table name access
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return (db.query as any)[config.tableName].findFirst({
				where: options?.where,
				with: options?.with ?? config.defaultRelations
			}) as Promise<TReturn | undefined>;
		}
	};
}
