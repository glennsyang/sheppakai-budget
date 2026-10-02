import type {
	BuildQueryResult,
	Column,
	DBQueryConfig,
	ExtractTablesWithRelations,
	SQL
} from 'drizzle-orm';

import { getDb } from '../index';
import type * as schema from '../schema';

type Schema = ExtractTablesWithRelations<typeof schema>;
type QueryConfig<T extends TableName> = DBQueryConfig<'many', true, Schema, Schema[T]>;

/** Relational-query key of a table, e.g. `'transaction'` — the keys of `db.query`. */
export type TableName = keyof Schema;
/** Tables with an `id` primary key — the only ones `findById` makes sense for. */
type IdTableName = {
	[K in TableName]: 'id' extends keyof Schema[K]['columns'] ? K : never;
}[TableName];
export type QueryWith<T extends TableName> = NonNullable<QueryConfig<T>['with']>;
type QueryWhere<T extends TableName> = QueryConfig<T>['where'];

/** Row shape Drizzle returns for table `T` loaded with relations `W`. */
export type QueryRow<
	T extends TableName,
	W extends QueryWith<T> = Record<never, never>
> = BuildQueryResult<Schema, Schema[T], { with: W }>;

interface QueryBuilderConfig<T extends TableName, W extends QueryWith<T>> {
	tableName: T;
	defaultRelations?: W;
	defaultOrderBy?: SQL[];
}

export function createQueryBuilder<
	T extends IdTableName,
	const W extends QueryWith<T> = Record<never, never>
>(config: QueryBuilderConfig<T, W>) {
	const query = () => getDb().query[config.tableName];
	// TypeScript can't evaluate Drizzle's result type while `T` is still generic, so the
	// raw query result is narrowed to the `QueryRow` Drizzle computes for the concrete
	// table. Every caller passes a literal `tableName`, so that type is fully checked there.
	const rows = <R>(result: Promise<unknown>) => result as Promise<R>;
	// `T extends IdTableName` guarantees an `id` column; generic `T` just hides it.
	const idColumn = (fields: object) => (fields as { id: Column }).id;

	return {
		// Find all with optional filters
		findAll: async <const OW extends QueryWith<T> = W>(options?: {
			where?: SQL;
			orderBy?: SQL[];
			with?: OW;
			limit?: number;
		}): Promise<QueryRow<T, OW>[]> => {
			return rows(
				query().findMany({
					with: options?.with ?? config.defaultRelations,
					where: options?.where,
					orderBy: options?.orderBy ?? config.defaultOrderBy,
					limit: options?.limit
				})
			);
		},

		// Find by ID with relations
		findById: async <R extends boolean = true>(
			id: string,
			withRelations: R = true as R
		): Promise<(R extends true ? QueryRow<T, W> : QueryRow<T>) | undefined> => {
			return rows(
				query().findFirst({
					where: (table, { eq }) => eq(idColumn(table), id),
					with: withRelations ? config.defaultRelations : undefined
				})
			);
		},

		// Find first matching a condition
		findFirst: async <const OW extends QueryWith<T> = W>(options?: {
			where?: SQL | QueryWhere<T>;
			with?: OW;
		}): Promise<QueryRow<T, OW> | undefined> => {
			return rows(
				query().findFirst({
					where: options?.where,
					with: options?.with ?? config.defaultRelations
				})
			);
		}
	};
}
