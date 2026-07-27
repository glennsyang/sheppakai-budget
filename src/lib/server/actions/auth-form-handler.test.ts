import { redirect } from '@sveltejs/kit';
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
					fallbackMessage: 'fallback',
					buildErrorPayload: (errorMessage) => errorMessage
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
				fallbackMessage: 'fallback',
				buildErrorPayload: (errorMessage) => ({ type: 'error', text: errorMessage })
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
});
