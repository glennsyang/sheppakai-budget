import { isRedirect } from '@sveltejs/kit';
import type { Redirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createAuthLoadForm, redirectIfAuthenticated } from './form-helpers';

const schema = z.object({ email: z.string() });
const at = (path: string) => new URL(`https://example.com${path}`);

describe('redirectIfAuthenticated', () => {
	it('throws a redirect to the post-login route when a user is present', () => {
		let caught: unknown;
		try {
			redirectIfAuthenticated({ id: 'user_1' } as App.Locals['user']);
		} catch (e) {
			caught = e;
		}

		expect(isRedirect(caught)).toBe(true);
		expect((caught as Redirect).location).toBe('/dashboard');
	});

	it('does nothing when signed out', () => {
		expect(() => redirectIfAuthenticated(undefined)).not.toThrow();
	});
});

describe('createAuthLoadForm', () => {
	it('returns a superforms object with no banner by default', async () => {
		const form = await createAuthLoadForm(schema, at('/sign-in'));
		expect(form.message).toBeUndefined();
	});

	it('surfaces a redirect-carried ?message as an error banner', async () => {
		const form = await createAuthLoadForm(schema, at('/sign-in?message=Please%20sign%20in'));
		expect(form.message).toEqual({ type: 'error', text: 'Please sign in' });
	});

	it('never trusts ?messageType — a redirect banner is always an error', async () => {
		const form = await createAuthLoadForm(
			schema,
			at('/sign-in?message=Nice%20try&messageType=success')
		);
		expect((form.message as App.Superforms.Message).type).toBe('error');
	});

	it('strips HTML tags from the query message', async () => {
		const form = await createAuthLoadForm(schema, at('/sign-in?message=%3Cb%3Ehi%3C%2Fb%3Ethere'));
		expect(form.message).toEqual({ type: 'error', text: 'hithere' });
	});

	it('strips an unterminated tag (no dangling <script)', async () => {
		const form = await createAuthLoadForm(schema, at('/sign-in?message=hi%20%3Cscript'));
		const text = (form.message as App.Superforms.Message).text;
		expect(text).not.toContain('<');
		expect(text).toBe('hi ');
	});

	it('truncates the query message to 200 characters', async () => {
		const form = await createAuthLoadForm(schema, at(`/sign-in?message=${'x'.repeat(300)}`));
		expect((form.message as App.Superforms.Message).text).toHaveLength(200);
	});

	it('ignores the query message when includeQueryMessage is false', async () => {
		const form = await createAuthLoadForm(schema, at('/reset-password?message=nope'), {
			includeQueryMessage: false
		});
		expect(form.message).toBeUndefined();
	});
});
