import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AuthFormMessage from './AuthFormMessage.svelte';

describe('AuthFormMessage', () => {
	it('renders nothing when there is no message', () => {
		const html = render(AuthFormMessage, { props: { message: undefined } }).body;

		expect(html).not.toContain('<div');
	});

	it('renders success styling for messages containing "successful"', () => {
		const html = render(AuthFormMessage, {
			props: { message: 'Registration successful! Please sign in.' }
		}).body;

		expect(html).toContain('Registration successful! Please sign in.');
		expect(html).toContain('bg-green-50/80');
		expect(html).toContain('text-green-700');
	});

	it('renders error styling for any other message', () => {
		const html = render(AuthFormMessage, {
			props: { message: 'Invalid email or password' }
		}).body;

		expect(html).toContain('Invalid email or password');
		expect(html).toContain('bg-red-50/80');
		expect(html).toContain('text-red-700');
	});
});
