import { describe, expect, it } from 'vitest';

import { verifyCronAuthorization } from './cron-auth';

const strongSecret = 'a_very_strong_cron_secret_value_123';

describe('verifyCronAuthorization', () => {
	it('fails closed when secret is missing', () => {
		const result = verifyCronAuthorization(`Bearer ${strongSecret}`, undefined);
		expect(result).toEqual({ authorized: false, reason: 'missing_secret' });
	});

	it('fails closed when secret is blank', () => {
		const result = verifyCronAuthorization('Bearer token', '   ');
		expect(result).toEqual({ authorized: false, reason: 'blank_secret' });
	});

	it('fails closed when secret is too weak', () => {
		const result = verifyCronAuthorization('Bearer token', 'short-secret');
		expect(result).toEqual({ authorized: false, reason: 'weak_secret' });
	});

	it('rejects missing authorization header', () => {
		const result = verifyCronAuthorization(null, strongSecret);
		expect(result).toEqual({ authorized: false, reason: 'missing_header' });
	});

	it('rejects malformed authorization header', () => {
		expect(verifyCronAuthorization('Bearer', strongSecret)).toEqual({
			authorized: false,
			reason: 'malformed_header'
		});
		expect(verifyCronAuthorization('Bearer token extra', strongSecret)).toEqual({
			authorized: false,
			reason: 'malformed_header'
		});
		expect(verifyCronAuthorization('Bearer ', strongSecret)).toEqual({
			authorized: false,
			reason: 'malformed_header'
		});
	});

	it('rejects non-bearer auth schemes', () => {
		const result = verifyCronAuthorization('Basic token', strongSecret);
		expect(result).toEqual({ authorized: false, reason: 'invalid_scheme' });
	});

	it('rejects token mismatch', () => {
		const result = verifyCronAuthorization('Bearer wrong-token', strongSecret);
		expect(result).toEqual({ authorized: false, reason: 'token_mismatch' });
	});

	it('authorizes valid bearer token with strong secret', () => {
		const result = verifyCronAuthorization(`Bearer ${strongSecret}`, strongSecret);
		expect(result).toEqual({ authorized: true });
	});
});
