import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AuthCardLayout from './AuthCardLayout.svelte';

const snippet = (html: string) => createRawSnippet(() => ({ render: () => html }));

describe('AuthCardLayout', () => {
	it('renders the title, description and children', () => {
		const html = render(AuthCardLayout, {
			props: {
				title: 'Sign In',
				description: 'Enter your credentials to access your account',
				children: snippet('<form>form body</form>')
			}
		}).body;

		expect(html).toContain('Sign In');
		expect(html).toContain('Enter your credentials to access your account');
		expect(html).toContain('form body');
		expect(html).toContain('max-w-md');
		expect(html).toContain('backdrop-blur-md');
	});

	it('omits the footer wrapper when no footer snippet is supplied', () => {
		const html = render(AuthCardLayout, {
			props: {
				title: 'Reset Password',
				description: 'Enter your new password',
				children: snippet('<form>form body</form>')
			}
		}).body;

		expect(html).not.toContain('space-y-2 text-center');
	});

	it('renders the footer snippet when supplied', () => {
		const html = render(AuthCardLayout, {
			props: {
				title: 'Register',
				description: 'Create your account to get started',
				children: snippet('<form>form body</form>'),
				footer: snippet('<a href="/auth/sign-in">Sign in here</a>')
			}
		}).body;

		expect(html).toContain('space-y-2 text-center');
		expect(html).toContain('Sign in here');
	});
});
