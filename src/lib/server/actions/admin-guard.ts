import { fail } from '@sveltejs/kit';
import { message, type SuperValidated } from 'sveltekit-superforms';

import { requireAdmin } from '../auth';

/**
 * Returns null when the caller is an admin, otherwise the failure response to return from the action.
 *
 * Pass `form` to get the contract-compliant shape from `docs/ERROR_HANDLING_POLICY.md`
 * (`message(form, { type: 'error' }, { status })`), so the page can render the reason from `$message`.
 * Callers that have not yet been migrated may omit it and keep the older `fail(status, { error })`.
 */
export function adminAuthFailure<T extends Record<string, unknown>>(
	locals: App.Locals,
	form?: SuperValidated<T>
) {
	try {
		requireAdmin(locals);
		return null;
	} catch {
		const status = locals.user ? 403 : 401;
		const text = locals.user ? 'Forbidden' : 'Unauthorized';

		return form
			? message(form, { type: 'error', text }, { status })
			: fail(status, { error: text });
	}
}
