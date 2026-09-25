import { describe, expect, it, vi } from 'vitest';

vi.mock('../index', () => ({ getDb: vi.fn<() => never>() }));

import { parsePermissions } from './apiKeys';

describe('parsePermissions', () => {
	it('parses the JSON the api-key plugin stores', () => {
		expect(parsePermissions('{"transactions":["read","write"]}')).toEqual({
			transactions: ['read', 'write']
		});
	});

	it('returns null for an empty value', () => {
		expect(parsePermissions(null)).toBeNull();
		expect(parsePermissions('')).toBeNull();
	});

	it('returns null for malformed or non-object JSON', () => {
		expect(parsePermissions('{not json')).toBeNull();
		expect(parsePermissions('"a string"')).toBeNull();
		expect(parsePermissions('null')).toBeNull();
	});
});
