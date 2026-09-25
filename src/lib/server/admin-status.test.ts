import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({ ADMIN_USER_IDS: 'env-admin-1,env-admin-2' }));

import { isAdminUser, isBanActive } from './admin-status';

describe('isAdminUser', () => {
	it('is true for a user with the admin role', () => {
		expect(isAdminUser({ id: 'u1', role: 'admin' })).toBe(true);
	});

	it('is true for a user listed in ADMIN_USER_IDS, whatever their role', () => {
		expect(isAdminUser({ id: 'env-admin-2', role: 'user' })).toBe(true);
		expect(isAdminUser({ id: 'env-admin-1', role: null })).toBe(true);
	});

	it('is false for a plain user not in ADMIN_USER_IDS', () => {
		expect(isAdminUser({ id: 'u1', role: 'user' })).toBe(false);
		expect(isAdminUser({ id: 'u1' })).toBe(false);
	});
});

describe('isBanActive', () => {
	const now = new Date('2026-09-25T12:00:00Z');

	it('is false for a user who is not banned', () => {
		expect(isBanActive({ banned: false }, now)).toBe(false);
		expect(isBanActive({ banned: null }, now)).toBe(false);
	});

	it('is true for a permanent ban', () => {
		expect(isBanActive({ banned: true, banExpires: null }, now)).toBe(true);
	});

	it('is true for a ban that expires in the future', () => {
		expect(isBanActive({ banned: true, banExpires: new Date('2026-09-26T00:00:00Z') }, now)).toBe(
			true
		);
	});

	it('is false for a ban that has already expired', () => {
		expect(isBanActive({ banned: true, banExpires: new Date('2026-09-24T00:00:00Z') }, now)).toBe(
			false
		);
	});
});
