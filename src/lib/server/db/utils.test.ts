import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// withAuditFieldsForUpdate calls getCurrentUTCTimestamp inline, so we
// can control the clock via fake timers.
import { generateId, withAuditFieldsForCreate, withAuditFieldsForUpdate } from './utils';

const makeUser = (id = 'user-1') =>
	({
		id,
		name: 'Test User',
		email: 'test@example.com',
		emailVerified: false,
		createdAt: new Date(),
		updatedAt: new Date()
	}) as unknown as Parameters<typeof withAuditFieldsForCreate>[1];

describe('withAuditFieldsForCreate', () => {
	it('adds createdBy and updatedBy from user.id', () => {
		const data = { name: 'groceries', amount: 50 };
		const result = withAuditFieldsForCreate(data, makeUser('abc'));

		expect(result.createdBy).toBe('abc');
		expect(result.updatedBy).toBe('abc');
	});

	it('preserves all original data fields', () => {
		const data = { name: 'rent', amount: 1200, categoryId: 'cat-1' };
		const result = withAuditFieldsForCreate(data, makeUser());

		expect(result.name).toBe('rent');
		expect(result.amount).toBe(1200);
		expect(result.categoryId).toBe('cat-1');
	});

	it('does not mutate the original data object', () => {
		const data = { name: 'original' };
		withAuditFieldsForCreate(data, makeUser());

		expect(Object.keys(data)).not.toContain('createdBy');
	});
});

describe('withAuditFieldsForUpdate', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-15T10:30:00.000Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('adds updatedBy from user.id', () => {
		const result = withAuditFieldsForUpdate({ amount: 200 }, makeUser('xyz'));
		expect(result.updatedBy).toBe('xyz');
	});

	it('adds updatedAt as SQLite-compatible UTC timestamp', () => {
		const result = withAuditFieldsForUpdate({ amount: 200 }, makeUser());
		// SQLite current_timestamp format: YYYY-MM-DD HH:MM:SS (space-separated, no milliseconds)
		expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
		expect(result.updatedAt).toBe('2026-03-15 10:30:00');
	});

	it('preserves all original data fields', () => {
		const data = { name: 'updated name', amount: 99 };
		const result = withAuditFieldsForUpdate(data, makeUser());

		expect(result.name).toBe('updated name');
		expect(result.amount).toBe(99);
	});

	it('does not mutate the original data object', () => {
		const data = { name: 'original' };
		withAuditFieldsForUpdate(data, makeUser());

		expect(Object.keys(data)).not.toContain('updatedBy');
	});
});

describe('generateId', () => {
	it('returns a non-empty string', () => {
		expect(typeof generateId()).toBe('string');
		expect(generateId().length).toBeGreaterThan(0);
	});

	it('returns a value matching UUID v4 format', () => {
		const uuid = generateId();
		expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
	});

	it('returns a unique value on each call', () => {
		const ids = new Set(Array.from({ length: 20 }, generateId));
		expect(ids.size).toBe(20);
	});
});
