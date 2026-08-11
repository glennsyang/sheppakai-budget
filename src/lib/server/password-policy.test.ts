import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/private', () => ({
	PASSWORD_ROTATION_DAYS: 120
}));

import { isPasswordExpired } from './password-policy';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('isPasswordExpired', () => {
	it('returns false for a password changed recently', () => {
		expect(isPasswordExpired(new Date(Date.now() - 1 * DAY_MS))).toBe(false);
	});

	it('returns false for a password exactly at the threshold', () => {
		expect(isPasswordExpired(new Date(Date.now() - 120 * DAY_MS))).toBe(false);
	});

	it('returns true for a password older than the threshold', () => {
		expect(isPasswordExpired(new Date(Date.now() - 121 * DAY_MS))).toBe(true);
	});

	it('returns false when there is no recorded password change', () => {
		expect(isPasswordExpired(null)).toBe(false);
		expect(isPasswordExpired(undefined)).toBe(false);
	});
});
