import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AuthFormMessage from './AuthFormMessage.svelte';

describe('AuthFormMessage', () => {
	it('renders nothing when there is no message', () => {
		const html = render(AuthFormMessage, { props: { message: undefined } }).body;

		expect(html).not.toContain('<div');
	});

	it('renders success styling for a success message', () => {
		const html = render(AuthFormMessage, {
			props: { message: { type: 'success', text: 'Registration successful! Please sign in.' } }
		}).body;

		expect(html).toContain('Registration successful! Please sign in.');
		expect(html).toContain('bg-green-50/80');
		expect(html).toContain('text-green-700');
	});

	it('renders error styling for an error message', () => {
		const html = render(AuthFormMessage, {
			props: { message: { type: 'error', text: 'Invalid email or password' } }
		}).body;

		expect(html).toContain('Invalid email or password');
		expect(html).toContain('bg-red-50/80');
		expect(html).toContain('text-red-700');
	});

	it('styles from the type rather than the wording of the text', () => {
		// The old implementation sniffed for "successful" in the text, which mis-styled
		// forgot-password's success message as an error.
		const html = render(AuthFormMessage, {
			props: {
				message: {
					type: 'success',
					text: 'If an account exists with that email, you will receive a password reset link.'
				}
			}
		}).body;

		expect(html).toContain('bg-green-50/80');
		expect(html).not.toContain('bg-red-50/80');
	});
});
