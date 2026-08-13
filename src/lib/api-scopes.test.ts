import { describe, expect, it } from 'vitest';

import { permissionsForScope, scopesToPermissions } from './api-scopes';

describe('scopesToPermissions', () => {
	it('groups scopes by resource', () => {
		expect(
			scopesToPermissions(['transactions:read', 'transactions:write', 'budgets:read'])
		).toEqual({
			transactions: ['read', 'write'],
			budgets: ['read']
		});
	});

	it('returns an empty object for no scopes', () => {
		expect(scopesToPermissions([])).toEqual({});
	});
});

describe('permissionsForScope', () => {
	it('builds a single-resource permissions record', () => {
		expect(permissionsForScope('dashboard:read')).toEqual({ dashboard: ['read'] });
	});
});
