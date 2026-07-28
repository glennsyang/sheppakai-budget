import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
import { redirect } from '@sveltejs/kit';
import { render } from 'svelte/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { handleAuthFormAction } from './auth-form-handler';

const testSchema = z.object({
	email: z.string().email()
});

describe('handleAuthFormAction', () => {
	it('rethrows redirect errors without converting them to form failures', async () => {
		const form = await superValidate(zod4(testSchema));

		await expect(
			handleAuthFormAction(
				form,
				async () => {
					throw redirect(302, '/dashboard');
				},
				{
					loggerContext: 'test',
					fallbackMessage: 'fallback'
				}
			)
		).rejects.toMatchObject({
			status: 302,
			location: '/dashboard'
		});
	});

	it('returns a form failure payload for auth errors', async () => {
		const form = await superValidate(zod4(testSchema));
		const result = await handleAuthFormAction(
			form,
			async () => {
				throw new Error('boom');
			},
			{
				loggerContext: 'test',
				fallbackMessage: 'fallback'
			}
		);

		expect(result).toMatchObject({
			status: 400,
			data: {
				form: expect.objectContaining({
					valid: false,
					message: { type: 'error', text: 'fallback' }
				})
			}
		});
	});

	it('honours errorType so a route can keep failures indistinguishable from successes', async () => {
		const form = await superValidate(zod4(testSchema));
		const result = await handleAuthFormAction(
			form,
			async () => {
				throw new Error('boom');
			},
			{
				loggerContext: 'test',
				fallbackMessage: 'If an account exists with that email, you will receive a link.',
				errorType: 'success'
			}
		);

		expect(result).toMatchObject({
			data: {
				form: expect.objectContaining({
					message: {
						type: 'success',
						text: 'If an account exists with that email, you will receive a link.'
					}
				})
			}
		});
	});

	it('produces a payload the auth banner can actually render', async () => {
		// Regression guard for #295: register and reset-password sent an object while
		// the pages called `.includes()` on it, throwing "includes is not a function".
		const form = await superValidate(zod4(testSchema));
		const result = (await handleAuthFormAction(
			form,
			async () => {
				throw new Error('boom');
			},
			{ loggerContext: 'test', fallbackMessage: 'Registration failed. Please try again.' }
		)) as { data: { form: { message: App.Superforms.Message } } };

		const html = render(AuthFormMessage, { props: { message: result.data.form.message } }).body;

		expect(html).toContain('Registration failed. Please try again.');
		expect(html).toContain('bg-red-50/80');
	});
});
