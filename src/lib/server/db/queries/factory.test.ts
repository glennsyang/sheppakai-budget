import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findMany: vi.fn(async () => []),
	findFirst: vi.fn(async () => undefined),
	getDb: vi.fn()
}));

vi.mock('../index', () => ({
	getDb: mockState.getDb
}));

import { createQueryBuilder } from './factory';

describe('createQueryBuilder', () => {
	beforeEach(() => {
		mockState.findMany.mockReset();
		mockState.findFirst.mockReset();
		mockState.getDb.mockReset();
		mockState.findMany.mockResolvedValue([]);
		mockState.findFirst.mockResolvedValue(undefined);
		mockState.getDb.mockReturnValue({
			query: {
				transaction: {
					findMany: mockState.findMany,
					findFirst: mockState.findFirst
				}
			}
		});
	});

	it('findAll uses default relations and order by when options are omitted', async () => {
		const builder = createQueryBuilder({
			tableName: 'transaction',
			defaultRelations: { category: true },
			defaultOrderBy: [{ sql: 'ORDER' }] as never[]
		});

		await builder.findAll();

		expect(mockState.findMany).toHaveBeenCalledWith({
			with: { category: true },
			where: undefined,
			orderBy: [{ sql: 'ORDER' }]
		});
	});

	it('findAll allows overriding where/with/orderBy', async () => {
		const builder = createQueryBuilder({
			tableName: 'transaction',
			defaultRelations: { category: true },
			defaultOrderBy: [{ sql: 'DEFAULT' }] as never[]
		});

		await builder.findAll({
			where: { sql: 'WHERE' } as never,
			with: { user: true },
			orderBy: [{ sql: 'CUSTOM' }] as never[]
		});

		expect(mockState.findMany).toHaveBeenCalledWith({
			with: { user: true },
			where: { sql: 'WHERE' },
			orderBy: [{ sql: 'CUSTOM' }]
		});
	});

	it('findById includes default relations by default', async () => {
		const builder = createQueryBuilder({
			tableName: 'transaction',
			defaultRelations: { category: true }
		});

		await builder.findById('tx-1');

		expect(mockState.findFirst).toHaveBeenCalledWith({
			where: expect.any(Function),
			with: { category: true }
		});
	});

	it('findById omits relations when withRelations is false', async () => {
		const builder = createQueryBuilder({
			tableName: 'transaction',
			defaultRelations: { category: true }
		});

		await builder.findById('tx-1', false);

		expect(mockState.findFirst).toHaveBeenCalledWith({
			where: expect.any(Function),
			with: undefined
		});
	});

	it('findFirst uses default relations and supports custom where', async () => {
		const where = vi.fn();
		const builder = createQueryBuilder({
			tableName: 'transaction',
			defaultRelations: { category: true }
		});

		await builder.findFirst({ where: where as never });

		expect(mockState.findFirst).toHaveBeenCalledWith({
			where,
			with: { category: true }
		});
	});
});
