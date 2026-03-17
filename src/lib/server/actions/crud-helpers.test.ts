import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { z } from 'zod';

type MockState = {
	superValidateResult: { valid: boolean; data: Record<string, unknown> };
	fail: ReturnType<typeof vi.fn>;
	message: ReturnType<typeof vi.fn>;
	superValidate: ReturnType<typeof vi.fn>;
	insertReturning: ReturnType<typeof vi.fn>;
	insertValues: ReturnType<typeof vi.fn>;
	insert: ReturnType<typeof vi.fn>;
	updateWhere: ReturnType<typeof vi.fn>;
	updateSet: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	deleteWhere: ReturnType<typeof vi.fn>;
	deleteFrom: ReturnType<typeof vi.fn>;
	db: {
		insert: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
	beforeCreate: Mock<(data: Record<string, unknown>, userId: string) => Promise<void>>;
	afterCreate: Mock<(id: string, data: Record<string, unknown>) => Promise<void>>;
	beforeUpdate: Mock<
		(id: string, data: Record<string, unknown>, userId: string) => Promise<unknown>
	>;
	afterUpdate: Mock<
		(id: string, data: Partial<Record<string, unknown>>, context: unknown) => Promise<void>
	>;
	beforeDelete: Mock<(id: string, userId: string) => Promise<void | { error: string }>>;
	afterDelete: Mock<(id: string) => Promise<void>>;
	loggerInfo: ReturnType<typeof vi.fn>;
	loggerError: ReturnType<typeof vi.fn>;
	requireAuth: ReturnType<typeof vi.fn>;
};

const mockState: MockState = vi.hoisted((): MockState => {
	const state = {
		superValidateResult: { valid: true, data: {} as Record<string, unknown> },
		fail: vi.fn((status: number, data: Record<string, unknown>) => ({
			status,
			data,
			__failure: true
		})),
		message: vi.fn(
			(
				form: Record<string, unknown>,
				payload: { type: string; text: string },
				opts?: { status: number }
			) => ({
				status: opts?.status ?? 200,
				form,
				message: payload,
				__message: true
			})
		),
		superValidate: vi.fn(),
		insertReturning: vi.fn(),
		insertValues: vi.fn(),
		insert: vi.fn(),
		updateWhere: vi.fn(),
		updateSet: vi.fn(),
		update: vi.fn(),
		deleteWhere: vi.fn(),
		deleteFrom: vi.fn(),
		db: {
			insert: vi.fn(),
			update: vi.fn(),
			delete: vi.fn()
		},
		beforeCreate: vi.fn(),
		afterCreate: vi.fn(),
		beforeUpdate: vi.fn(),
		afterUpdate: vi.fn(),
		beforeDelete: vi.fn(),
		afterDelete: vi.fn(),
		loggerInfo: vi.fn(),
		loggerError: vi.fn(),
		requireAuth: vi.fn()
	} as MockState;

	state.superValidate = vi.fn(async () => state.superValidateResult);
	state.insertReturning = vi.fn(async () => [{ id: 'new-id', name: 'created' }]);
	state.insertValues = vi.fn(() => ({ returning: state.insertReturning }));
	state.insert = vi.fn(() => ({ values: state.insertValues }));
	state.updateWhere = vi.fn(async () => []);
	state.updateSet = vi.fn(() => ({ where: state.updateWhere }));
	state.update = vi.fn(() => ({ set: state.updateSet }));
	state.deleteWhere = vi.fn(async () => []);
	state.deleteFrom = vi.fn(() => ({ where: state.deleteWhere }));
	state.beforeCreate = vi.fn(async () => undefined);
	state.afterCreate = vi.fn(async () => undefined);
	state.beforeUpdate = vi.fn(async () => undefined);
	state.afterUpdate = vi.fn(async () => undefined);
	state.beforeDelete = vi.fn(async () => undefined);
	state.afterDelete = vi.fn(async () => undefined);
	state.requireAuth = vi.fn(
		(handler: (event: unknown, user: { id: string }) => Promise<unknown>) => {
			return async (event: unknown) => handler(event, { id: 'user-1' });
		}
	);

	state.db = {
		insert: state.insert,
		update: state.update,
		delete: state.deleteFrom
	};

	return state;
});

mockState.db = {
	insert: mockState.insert,
	update: mockState.update,
	delete: mockState.deleteFrom
};

vi.mock('@sveltejs/kit', () => ({
	fail: mockState.fail
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: mockState.superValidate,
	message: mockState.message
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod4: (schema: unknown) => schema
}));

vi.mock('drizzle-orm', () => ({
	eq: (field: unknown, value: unknown) => ({ field, value }),
	getTableColumns: () => ({ id: 'id-column' })
}));

vi.mock('$lib/server/db', () => ({
	getDb: () => mockState.db
}));

vi.mock('$lib/server/logger', () => ({
	logger: {
		info: mockState.loggerInfo,
		error: mockState.loggerError
	}
}));

vi.mock('./auth-guard', () => ({
	requireAuth: mockState.requireAuth
}));

import { createAction, deleteAction, updateAction } from './crud-helpers';

describe('crud-helpers', () => {
	const baseSchema = z.object({
		id: z.string().optional(),
		name: z.string(),
		amount: z.number().optional()
	});

	const mockTable = { id: 'id-column' } as unknown as Parameters<typeof createAction>[0]['table'];

	const makeEvent = (formEntries: Array<[string, string]> = []) => {
		const formData = new FormData();
		for (const [key, value] of formEntries) {
			formData.append(key, value);
		}
		return {
			request: {
				formData: async () => formData
			},
			locals: {
				user: { id: 'event-user' }
			}
		} as unknown;
	};

	beforeEach(() => {
		mockState.superValidateResult = {
			valid: true,
			data: { id: 'record-1', name: 'Row 1', amount: 10 }
		};
		mockState.fail.mockClear();
		mockState.message.mockClear();
		mockState.superValidate.mockClear();
		mockState.insertReturning.mockReset();
		mockState.insertReturning.mockResolvedValue([{ id: 'new-id', name: 'created' }]);
		mockState.insertValues.mockClear();
		mockState.insert.mockClear();
		mockState.updateWhere.mockClear();
		mockState.updateSet.mockClear();
		mockState.update.mockClear();
		mockState.deleteWhere.mockClear();
		mockState.deleteFrom.mockClear();
		mockState.beforeCreate.mockClear();
		mockState.afterCreate.mockClear();
		mockState.beforeUpdate.mockClear();
		mockState.afterUpdate.mockClear();
		mockState.beforeDelete.mockClear();
		mockState.afterDelete.mockClear();
		mockState.loggerInfo.mockClear();
		mockState.loggerError.mockClear();
	});

	it('createAction returns 400 when form is invalid', async () => {
		mockState.superValidateResult = { valid: false, data: {} };
		const action = createAction({ schema: baseSchema, table: mockTable, entityName: 'Thing' });

		const result = await action(makeEvent() as never);

		expect(mockState.fail).toHaveBeenCalledWith(400, { form: mockState.superValidateResult });
		expect(result).toEqual({
			status: 400,
			data: { form: mockState.superValidateResult },
			__failure: true
		});
	});

	it('createAction inserts transformed data, applies audit fields, and runs hooks', async () => {
		const beforeCreate = mockState.beforeCreate as unknown as NonNullable<
			Parameters<typeof createAction>[0]['beforeCreate']
		>;
		const afterCreate = mockState.afterCreate as unknown as NonNullable<
			Parameters<typeof createAction>[0]['afterCreate']
		>;

		const action = createAction({
			schema: baseSchema,
			table: mockTable,
			entityName: 'Thing',
			beforeCreate,
			afterCreate,
			transformCreate: (data) => ({ ...data, id: 'should-be-removed' })
		});

		const result = await action(makeEvent() as never);

		expect(mockState.beforeCreate).toHaveBeenCalledWith(
			{ id: 'record-1', name: 'Row 1', amount: 10 },
			'user-1'
		);
		expect(mockState.insert).toHaveBeenCalledWith(mockTable);
		expect(mockState.insertValues).toHaveBeenCalledTimes(1);
		const inserted = mockState.insertValues.mock.calls[0][0] as Record<string, unknown>;
		expect(inserted.id).toBeUndefined();
		expect(inserted.userId).toBe('user-1');
		expect(inserted.createdBy).toBe('user-1');
		expect(inserted.updatedBy).toBe('user-1');
		expect(mockState.afterCreate).toHaveBeenCalledWith('new-id', { id: 'new-id', name: 'created' });
		expect(result).toEqual({ success: true, create: true, form: mockState.superValidateResult });
	});

	it('updateAction requires id', async () => {
		mockState.superValidateResult = { valid: true, data: { name: 'No ID' } };
		const action = updateAction({ schema: baseSchema, table: mockTable, entityName: 'Thing' });

		const result = await action(makeEvent() as never);

		expect(mockState.fail).toHaveBeenCalledWith(400, { error: 'ID is required for update' });
		expect(result).toEqual({
			status: 400,
			data: { error: 'ID is required for update' },
			__failure: true
		});
	});

	it('updateAction updates record and runs hooks', async () => {
		const beforeUpdate = mockState.beforeUpdate as unknown as NonNullable<
			Parameters<typeof updateAction>[0]['beforeUpdate']
		>;
		const afterUpdate = mockState.afterUpdate as unknown as NonNullable<
			Parameters<typeof updateAction>[0]['afterUpdate']
		>;

		const action = updateAction({
			schema: baseSchema,
			table: mockTable,
			entityName: 'Thing',
			beforeUpdate,
			afterUpdate,
			transformUpdate: (data) => ({ ...data, id: 'remove-me' })
		});

		const result = await action(makeEvent() as never);

		expect(mockState.beforeUpdate).toHaveBeenCalledWith(
			'record-1',
			{ id: 'record-1', name: 'Row 1', amount: 10 },
			'user-1'
		);
		expect(mockState.update).toHaveBeenCalledWith(mockTable);
		expect(mockState.updateSet).toHaveBeenCalledTimes(1);
		const updated = mockState.updateSet.mock.calls[0][0] as Record<string, unknown>;
		expect(updated.id).toBeUndefined();
		expect(updated.updatedBy).toBe('user-1');
		expect(updated.updatedAt).toEqual(expect.any(String));
		expect(mockState.updateWhere).toHaveBeenCalledWith({ field: 'id-column', value: 'record-1' });
		expect(mockState.afterUpdate).toHaveBeenCalledWith(
			'record-1',
			expect.objectContaining({ name: 'Row 1' }),
			undefined
		);
		expect(result).toEqual({ success: true, update: true, form: mockState.superValidateResult });
	});

	it('updateAction passes beforeUpdate context to afterUpdate', async () => {
		mockState.beforeUpdate.mockResolvedValue({ previousAmount: 10 });
		const beforeUpdate = mockState.beforeUpdate as unknown as NonNullable<
			Parameters<typeof updateAction>[0]['beforeUpdate']
		>;
		const afterUpdate = mockState.afterUpdate as unknown as NonNullable<
			Parameters<typeof updateAction>[0]['afterUpdate']
		>;

		const action = updateAction({
			schema: baseSchema,
			table: mockTable,
			entityName: 'Thing',
			beforeUpdate,
			afterUpdate
		});

		await action(makeEvent() as never);

		expect(mockState.afterUpdate).toHaveBeenCalledWith(
			'record-1',
			expect.objectContaining({ name: 'Row 1' }),
			{ previousAmount: 10 }
		);
	});

	it('deleteAction without id fails validation', async () => {
		const action = deleteAction({ table: mockTable, entityName: 'Thing' });

		const result = await action(makeEvent() as never);

		expect(mockState.fail).toHaveBeenCalledWith(400, { hasId: false });
		expect(result).toEqual({ status: 400, data: { hasId: false }, __failure: true });
	});

	it('deleteAction returns hook error from beforeDelete', async () => {
		mockState.beforeDelete.mockResolvedValue({ error: 'Cannot delete' });
		const beforeDelete = mockState.beforeDelete as unknown as NonNullable<
			Parameters<typeof deleteAction>[0]['beforeDelete']
		>;

		const action = deleteAction({
			table: mockTable,
			entityName: 'Thing',
			beforeDelete
		});

		const result = await action(makeEvent([['id', 'row-1']]) as never);

		expect(mockState.beforeDelete).toHaveBeenCalledWith('row-1', 'user-1');
		expect(mockState.fail).toHaveBeenCalledWith(400, { error: 'Cannot delete' });
		expect(result).toEqual({ status: 400, data: { error: 'Cannot delete' }, __failure: true });
		expect(mockState.deleteFrom).not.toHaveBeenCalled();
	});

	it('deleteAction with schema uses superforms message for hook errors', async () => {
		mockState.superValidateResult = { valid: true, data: { id: 'row-2' } };
		mockState.beforeDelete.mockResolvedValue({ error: 'Blocked by dependency' });
		const beforeDelete = mockState.beforeDelete as unknown as NonNullable<
			Parameters<typeof deleteAction>[0]['beforeDelete']
		>;

		const action = deleteAction({
			table: mockTable,
			entityName: 'Thing',
			beforeDelete,
			deleteSchema: z.object({ id: z.string() })
		});

		const result = await action(makeEvent([['id', 'row-2']]) as never);

		expect(mockState.message).toHaveBeenCalledWith(
			mockState.superValidateResult,
			{ type: 'error', text: 'Blocked by dependency' },
			{ status: 400 }
		);
		expect(result).toEqual({
			status: 400,
			form: mockState.superValidateResult,
			message: { type: 'error', text: 'Blocked by dependency' },
			__message: true
		});
	});

	it('createAction returns message on database exception', async () => {
		mockState.insertValues.mockImplementationOnce(() => {
			throw new Error('write failed');
		});
		const action = createAction({ schema: baseSchema, table: mockTable, entityName: 'Thing' });

		const result = await action(makeEvent() as never);

		expect(mockState.loggerError).toHaveBeenCalled();
		expect(mockState.message).toHaveBeenCalledWith(
			mockState.superValidateResult,
			{
				type: 'error',
				text: 'Failed to create thing. A database error occurred.'
			},
			{ status: 400 }
		);
		expect(result).toEqual({
			status: 400,
			form: mockState.superValidateResult,
			message: { type: 'error', text: 'Failed to create thing. A database error occurred.' },
			__message: true
		});
	});
});
