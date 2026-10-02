import type { RequestEvent } from '@sveltejs/kit';
import { message, superValidate, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { zod4, type ZodValidationSchema } from 'sveltekit-superforms/adapters';

import { assertAdmin } from '../auth';
import { invalidForm } from './form-responses';

type AdminUser = NonNullable<App.Locals['user']>;

/**
 * Returns null when the caller is an admin, otherwise the failure response to return from the action,
 * in the contract-compliant shape from `docs/ERROR_HANDLING_POLICY.md`
 * (`message(form, { type: 'error' }, { status })`), so the page can render the reason from `$message`.
 */
function adminAuthFailure<T extends Record<string, unknown>>(
	locals: App.Locals,
	form: SuperValidated<T>
) {
	try {
		assertAdmin(locals);
		return null;
	} catch {
		const status = locals.user ? 403 : 401;
		const text = locals.user ? 'Forbidden' : 'Unauthorized';

		return message(form, { type: 'error', text }, { status });
	}
}

/**
 * Wraps an admin form action: validates the request against `schema`, rejects non-admins,
 * returns the invalid-form message, and only then calls `handler` with the parsed form and
 * the admin user. Every admin action should go through this — actions don't run layout
 * loads, so an action without its own guard is open to any caller.
 *
 * @example
 * export const actions = {
 *   restore: adminFormAction(restoreSchema, async (event, form, user) => {
 *     // user is an authenticated admin, form.data is valid
 *   })
 * };
 */
export function adminFormAction<
	S extends ZodValidationSchema,
	R,
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>
>(
	schema: S,
	handler: (
		event: RequestEvent<Params>,
		form: SuperValidated<Infer<S, 'zod4'>>,
		user: AdminUser
	) => Promise<R>,
	options: { invalidMessage?: string } = {}
) {
	return async (event: RequestEvent<Params>) => {
		// Validate before the guard so the guard has a form to attach its message to.
		const form = await superValidate(event.request, zod4(schema));

		const authFailure = adminAuthFailure(event.locals, form);
		if (authFailure) {
			return authFailure;
		}
		// Unreachable after adminAuthFailure, but narrows the user for the handler.
		if (!event.locals.user) {
			return message(form, { type: 'error', text: 'Unauthorized' }, { status: 401 });
		}

		if (!form.valid) {
			return invalidForm(form, options.invalidMessage);
		}

		return handler(event, form, event.locals.user);
	};
}
