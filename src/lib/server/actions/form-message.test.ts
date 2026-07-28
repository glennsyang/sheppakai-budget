import { describe, expect, it } from 'vitest';

import { formMessageFromUrl } from './form-message';

const at = (path: string) => new URL(path, 'https://example.test');

describe('formMessageFromUrl', () => {
	it('returns undefined when no message is present', () => {
		expect(formMessageFromUrl(at('/auth/sign-in'))).toBeUndefined();
	});

	it('reads an explicit success message', () => {
		expect(
			formMessageFromUrl(
				at('/auth/sign-in?message=Password%20reset%20successful&messageType=success')
			)
		).toEqual({ type: 'success', text: 'Password reset successful' });
	});

	it('reads an explicit error message', () => {
		expect(
			formMessageFromUrl(
				at('/auth/sign-in?message=Invalid%20verification%20link&messageType=error')
			)
		).toEqual({ type: 'error', text: 'Invalid verification link' });
	});

	it('falls back to error when the type is missing or unrecognised', () => {
		// The query string is attacker-controllable, so an unlabelled message must not
		// be able to present itself with the authority of a success banner.
		expect(
			formMessageFromUrl(at('/auth/sign-in?message=Your%20account%20is%20verified'))?.type
		).toBe('error');
		expect(
			formMessageFromUrl(at('/auth/sign-in?message=Nice%20try&messageType=SUCCESS'))?.type
		).toBe('error');
	});
});
