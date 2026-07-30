import { idSchema } from '$lib/formSchemas';
import { getDb } from '$lib/server/db';
import { withAuditFieldsForCreate, withAuditFieldsForUpdate } from '$lib/server/db/utils';
import { logger } from '$lib/server/logger';
import type { RequestEvent } from '@sveltejs/kit';
import { eq, getTableColumns } from 'drizzle-orm';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import { message, type SuperValidated, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { z, ZodType } from 'zod';

import { requireAuth } from './auth-guard';
import { type CrudMessages, getCrudMessage } from './messages';

/**
 * Type aliases - using Drizzle ORM's type inference to minimize 'any' usage
 * Note: SQLiteTableWithColumns requires 'any' in its constraint due to Drizzle's type system
 */
type AnyZodSchema = ZodType<Record<string, unknown>>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySQLiteTable = SQLiteTableWithColumns<any>;
type InferSchemaType<TSchema extends AnyZodSchema> = z.infer<TSchema>;
type InferInsertType<TTable extends AnySQLiteTable> = TTable['$inferInsert'];
type InferSelectType<TTable extends AnySQLiteTable> = TTable['$inferSelect'];

/**
 * Configuration for creating CRUD actions
 */
interface CrudConfig<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext = void
> {
	/** Zod schema for form validation */
	schema: TSchema;

	/** Drizzle table reference */
	table: TTable;

	/** Entity name for logging and messages (e.g., "Transaction", "Category") */
	entityName: string;

	/** Custom messages to override defaults */
	messages?: CrudMessages;

	/** Transform data before creating (e.g., format dates, convert types) */
	transformCreate?: (
		data: InferSchemaType<TSchema>,
		userId: string
	) => Partial<InferInsertType<TTable>>;

	/** Transform data before updating (e.g., format dates, convert types) */
	transformUpdate?: (
		data: InferSchemaType<TSchema>,
		userId: string
	) => Partial<InferInsertType<TTable>>;

	/** Hook to run before creating a record */
	beforeCreate?: (data: InferSchemaType<TSchema>, userId: string) => Promise<void>;

	/** Hook to run after creating a record */
	afterCreate?: (id: string, data: InferSelectType<TTable>) => Promise<void>;

	/** Hook to run before updating a record */
	beforeUpdate?: (
		id: string,
		data: InferSchemaType<TSchema>,
		userId: string
	) => Promise<TUpdateContext | void>;

	/** Hook to run after updating a record */
	afterUpdate?: (
		id: string,
		data: Partial<InferInsertType<TTable>>,
		context: TUpdateContext | undefined
	) => Promise<void>;

	/** Hook to run before deleting a record */
	beforeDelete?: (id: string, userId: string) => Promise<void | { error: string }>;

	/** Hook to run after deleting a record */
	afterDelete?: (id: string) => Promise<void>;
}

/**
 * The single validation-failure response, per `docs/ERROR_HANDLING_POLICY.md`. Superforms turns a
 * `message(...)` with a 4xx status into `fail(status, { form })`, so the page gets field errors
 * *and* a banner from one call — no bare `fail(...)` and nothing for a page to branch on.
 */
function invalidForm<TForm extends Record<string, unknown>>(
	form: SuperValidated<TForm>,
	text = 'Please correct the errors in the form.'
) {
	return message(form, { type: 'error', text }, { status: 400 });
}

/**
 * Create a generic create action handler
 */
function createCreateAction<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext
>(config: CrudConfig<TSchema, TTable, TUpdateContext>) {
	return requireAuth(async (event: RequestEvent, user) => {
		const form = await superValidate(event.request, zod4(config.schema));

		if (!form.valid) {
			return invalidForm(form);
		}

		const userId = user.id;

		try {
			// Run beforeCreate hook if provided
			if (config.beforeCreate) {
				await config.beforeCreate(form.data as InferSchemaType<TSchema>, userId);
			}

			// Transform data if transformer provided
			let dataToInsert: Partial<InferInsertType<TTable>> = config.transformCreate
				? config.transformCreate(form.data as InferSchemaType<TSchema>, userId)
				: { ...form.data };

			// Remove id field if present (it's auto-generated)
			const dataRecord = dataToInsert as Record<string, unknown>;
			delete dataRecord.id;

			// Add userId if not already present
			if (!dataRecord.userId) {
				dataRecord.userId = userId;
			}

			// Apply audit fields
			dataToInsert = withAuditFieldsForCreate(dataToInsert, user) as Partial<
				InferInsertType<TTable>
			>;

			// Insert into database
			const result = await getDb()
				.insert(config.table)
				.values(dataToInsert as InferInsertType<TTable>)
				.returning();

			logger.info(`${config.entityName} created successfully`);

			// Run afterCreate hook if provided
			if (config.afterCreate && result[0]) {
				const record = result[0] as InferSelectType<TTable>;
				await config.afterCreate((record as Record<string, unknown> & { id: string }).id, record);
			}
		} catch (error) {
			logger.error(`Failed to create ${config.entityName.toLowerCase()}`, error);
			return message(
				form,
				{
					type: 'error',
					text: getCrudMessage('createError', config.entityName, config.messages)
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'success',
			text: getCrudMessage('createSuccess', config.entityName, config.messages)
		});
	});
}

/**
 * Create a generic update action handler
 */
function createUpdateAction<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext
>(config: CrudConfig<TSchema, TTable, TUpdateContext>) {
	return requireAuth(async (event: RequestEvent, user) => {
		const form = await superValidate(event.request, zod4(config.schema));

		if (!form.valid) {
			return invalidForm(form);
		}

		const recordId = (form.data as Record<string, unknown> & { id?: string }).id;
		if (!recordId) {
			return invalidForm(form, 'ID is required for update');
		}

		const userId = user.id;
		let updateContext: TUpdateContext | undefined;

		try {
			// Run beforeUpdate hook if provided
			if (config.beforeUpdate) {
				updateContext = (await config.beforeUpdate(
					recordId,
					form.data as InferSchemaType<TSchema>,
					userId
				)) as TUpdateContext | undefined;
			}

			// Transform data if transformer provided
			let dataToUpdate: Partial<InferInsertType<TTable>> = config.transformUpdate
				? config.transformUpdate(form.data as InferSchemaType<TSchema>, userId)
				: ({ ...form.data } as Partial<InferInsertType<TTable>>);

			// Remove id field from update data
			const dataRecord = dataToUpdate as Record<string, unknown>;
			delete dataRecord.id;

			// Apply audit fields
			dataToUpdate = withAuditFieldsForUpdate(dataToUpdate, user) as Partial<
				InferInsertType<TTable>
			>;

			// Update in database
			const columns = getTableColumns(config.table);
			await getDb()
				.update(config.table)
				.set(dataToUpdate as InferInsertType<TTable>)
				.where(eq(columns.id, recordId));

			logger.info(`${config.entityName} updated successfully`, { id: recordId });

			// Run afterUpdate hook if provided
			if (config.afterUpdate) {
				await config.afterUpdate(recordId, dataToUpdate, updateContext);
			}
		} catch (error) {
			logger.error(`Failed to update ${config.entityName.toLowerCase()}`, error);
			return message(
				form,
				{
					type: 'error',
					text: getCrudMessage('updateError', config.entityName, config.messages)
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'success',
			text: getCrudMessage('updateSuccess', config.entityName, config.messages)
		});
	});
}

/**
 * Create a generic delete action handler.
 *
 * Every delete in the app takes an id and nothing else, so this validates against `idSchema`
 * rather than a per-caller schema. That keeps it on one code path, and so on the response
 * contract in `docs/ERROR_HANDLING_POLICY.md` — the raw-FormData variant it replaced could only
 * answer with a bare `fail(...)`, which no page could render.
 */
function createDeleteAction<TTable extends AnySQLiteTable>(
	config: Omit<CrudConfig<AnyZodSchema, TTable, unknown>, 'schema'>
) {
	return requireAuth(async (event: RequestEvent, user) => {
		const form = await superValidate(event.request, zod4(idSchema));

		if (!form.valid) {
			return invalidForm(form);
		}

		const recordId = (form.data as Record<string, unknown> & { id: string }).id;
		const userId = user.id;

		try {
			// Run beforeDelete hook if provided
			if (config.beforeDelete) {
				const result = await config.beforeDelete(recordId, userId);
				if (result && 'error' in result) {
					return message(form, { type: 'error', text: result.error }, { status: 400 });
				}
			}

			// Delete from database
			const columns = getTableColumns(config.table);
			await getDb().delete(config.table).where(eq(columns.id, recordId));

			logger.info(`${config.entityName} deleted successfully by:`, userId);

			// Run afterDelete hook if provided
			if (config.afterDelete) {
				await config.afterDelete(recordId);
			}
		} catch (error) {
			logger.error(`Failed to delete ${config.entityName.toLowerCase()}`, error);
			return message(
				form,
				{
					type: 'error',
					text: getCrudMessage('deleteError', config.entityName, config.messages)
				},
				{ status: 500 }
			);
		}

		return message(form, {
			type: 'success',
			text: getCrudMessage('deleteSuccess', config.entityName, config.messages)
		});
	});
}

/**
 * Factory function to create all CRUD actions at once
 *
 * @example
 * ```typescript
 * import { createCrudActions } from '$lib/server/actions/crud-helpers';
 * import { transactionSchema } from '$lib/formSchemas/finances';
 * import { transaction } from '$lib/server/db/schema';
 * import { formatDateForStorage } from '$lib/utils/dates';
 *
 * export const actions = createCrudActions({
 *   schema: transactionSchema,
 *   table: transaction,
 *   entityName: 'Transaction',
 *   transformCreate: (data, userId) => ({
 *     ...data,
 *     date: formatDateForStorage(data.date),
 *   }),
 *   transformUpdate: (data, userId) => ({
 *     ...data,
 *     date: formatDateForStorage(data.date),
 *   })
 * });
 * ```
 */
export function createCrudActions<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext = void
>(config: CrudConfig<TSchema, TTable, TUpdateContext>) {
	return {
		create: createCreateAction(config),
		update: createUpdateAction(config),
		delete: createDeleteAction(config as Omit<CrudConfig<AnyZodSchema, TTable, unknown>, 'schema'>)
	};
}

/**
 * Create individual action handlers for more flexibility
 */
export function createAction<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext = void
>(config: CrudConfig<TSchema, TTable, TUpdateContext>) {
	return createCreateAction(config);
}

export function updateAction<
	TSchema extends AnyZodSchema,
	TTable extends AnySQLiteTable,
	TUpdateContext = void
>(config: CrudConfig<TSchema, TTable, TUpdateContext>) {
	return createUpdateAction(config);
}

export function deleteAction<TTable extends AnySQLiteTable>(
	config: Omit<CrudConfig<AnyZodSchema, TTable, unknown>, 'schema'>
) {
	return createDeleteAction(config);
}
