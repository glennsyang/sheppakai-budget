import type { ApiScope } from '$lib/api-scopes';
import { scopesToPermissions } from '$lib/api-scopes';
import { createApiKeySchema, idSchema } from '$lib/formSchemas';
import { adminAuthFailure } from '$lib/server/actions/admin-guard';
import { invalidAuthForm } from '$lib/server/actions/auth-form-handler';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/server/logger';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const createForm = await superValidate(zod4(createApiKeySchema), { id: 'createApiKey' });
	const revokeForm = await superValidate(zod4(idSchema), { id: 'revokeApiKey' });

	try {
		const { apiKeys } = await auth.api.listApiKeys({ headers: request.headers });
		return { apiKeys, createForm, revokeForm };
	} catch (error) {
		logger.error('Failed to load API keys', error);
		return {
			apiKeys: [],
			loadError: 'Failed to load API keys. Please try refreshing the page.',
			createForm,
			revokeForm
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		// superValidate runs before the guard so the guard has a form to attach its message to.
		const form = await superValidate(request, zod4(createApiKeySchema));

		// The `!locals.user` arm is unreachable — adminAuthFailure already rejects anonymous
		// callers — but it narrows the type so `locals.user.id` below is safe.
		const authFailure = adminAuthFailure(locals, form);
		if (authFailure || !locals.user) {
			return authFailure ?? message(form, { type: 'error', text: 'Unauthorized' }, { status: 401 });
		}

		if (!form.valid) {
			return invalidAuthForm(form);
		}

		try {
			// Deliberately not passing `headers` here: the plugin only accepts server-only fields
			// like `permissions` and rate-limit overrides on a "trusted server" call (no headers/
			// request on the context), and rejects them outright on a session-based "client" call.
			const created = await auth.api.createApiKey({
				body: {
					name: form.data.name,
					userId: locals.user.id,
					permissions: scopesToPermissions(form.data.scopes as ApiScope[]),
					expiresIn: form.data.expiresInDays ? form.data.expiresInDays * 86400 : undefined
				}
			});

			logger.info('API key created', { keyId: created.id, scopes: form.data.scopes });

			// The plaintext key is only ever returned here, once. Ride it alongside the usual
			// message-bearing form rather than inventing a new response shape: `message()` sets
			// `form.message` and returns `{ form }`, so setting `form.message` by hand and adding
			// `apiKey` keeps the `$message`/`form.valid` contract every other page relies on while
			// giving this one page a value to read out of the raw ActionResult.
			form.message = {
				type: 'success',
				text: 'API key created. Copy it now — it will not be shown again.'
			};
			return { form, apiKey: created.key };
		} catch (error) {
			logger.error('Failed to create API key', error);
			return message(
				form,
				{ type: 'error', text: 'Failed to create API key. Please try again.' },
				{ status: 500 }
			);
		}
	},

	revoke: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(idSchema));

		const authFailure = adminAuthFailure(locals, form);
		if (authFailure) {
			return authFailure;
		}

		if (!form.valid) {
			return invalidAuthForm(form);
		}

		try {
			await auth.api.deleteApiKey({ body: { keyId: form.data.id }, headers: request.headers });
			logger.info('API key revoked', { keyId: form.data.id });
			return message(form, { type: 'success', text: 'API key revoked.' });
		} catch (error) {
			logger.error('Failed to revoke API key', error);
			return message(form, { type: 'error', text: 'Failed to revoke API key.' }, { status: 500 });
		}
	}
} satisfies Actions;
