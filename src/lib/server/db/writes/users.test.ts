import { describe, expect, it, vi } from 'vitest';

const mockUpdateWhere = vi.hoisted(() =>
	vi.fn<(where: unknown) => Promise<void>>(async () => undefined)
);
const mockUpdateSet = vi.hoisted(() =>
	vi.fn<(values: Record<string, unknown>) => { where: typeof mockUpdateWhere }>((values) => {
		void values;
		return { where: mockUpdateWhere };
	})
);
const mockUpdate = vi.hoisted(() =>
	vi.fn<(table: unknown) => { set: typeof mockUpdateSet }>(() => ({ set: mockUpdateSet }))
);

vi.mock('$lib/server/db', () => ({ getDb: () => ({ update: mockUpdate }) }));
vi.mock('drizzle-orm', () => ({ eq: (field: unknown, value: unknown) => ({ field, value }) }));
vi.mock('$lib/server/db/schema', () => ({ user: { id: 'user.id' } }));

import { updateUserName } from './users';

describe('updateUserName', () => {
	it('updates only the name, scoped to the user id', async () => {
		await updateUserName('user-1', 'New Name');

		expect(mockUpdateSet).toHaveBeenCalledWith({ name: 'New Name' });
		expect(mockUpdateWhere).toHaveBeenCalledWith({ field: 'user.id', value: 'user-1' });
	});
});
