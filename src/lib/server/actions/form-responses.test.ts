import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { invalidAuthForm } from './auth-form-handler';
import { invalidForm } from './form-responses';

const testSchema = z.object({
	name: z.string().min(1)
});

describe('invalidForm', () => {
	it('is the same helper as invalidAuthForm, not a second copy', () => {
		expect(invalidForm).toBe(invalidAuthForm);
	});

	it('returns a 400 form failure carrying the default error banner', async () => {
		const form = await superValidate(zod4(testSchema));

		expect(invalidForm(form)).toMatchObject({
			status: 400,
			data: {
				form: expect.objectContaining({
					valid: false,
					message: { type: 'error', text: 'Please correct the errors in the form.' }
				})
			}
		});
	});
});
