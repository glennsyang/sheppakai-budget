import { fail } from '@sveltejs/kit';

import { requireAdmin } from '../auth';

export function adminAuthFailure(locals: App.Locals) {
	try {
		requireAdmin(locals);
		return null;
	} catch {
		return fail(locals.user ? 403 : 401, {
			error: locals.user ? 'Forbidden' : 'Unauthorized'
		});
	}
}
