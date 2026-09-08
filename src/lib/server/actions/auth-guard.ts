import type { RequestEvent } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';

/**
 * Type representing an authenticated user from locals
 */
type AuthenticatedUser = NonNullable<App.Locals['user']>;

/**
 * Authorization wrapper for SvelteKit actions.
 * Ensures the user is authenticated before executing the action handler.
 *
 * @param handler - The action handler function that requires authentication
 * @returns A wrapped action handler that performs auth check
 *
 * @example
 * export const actions = {
 *   create: requireAuth(async (event, user) => {
 *     // user is guaranteed to be defined here
 *     const userId = user.id;
 *     // ... rest of logic
 *   })
 * };
 */
export function requireAuth<T>(
	handler: (event: RequestEvent, user: AuthenticatedUser) => Promise<T>
): (event: RequestEvent) => Promise<T | ReturnType<typeof fail>> {
	return async (event: RequestEvent) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		return handler(event, event.locals.user);
	};
}

/**
 * Authorization wrapper for SvelteKit actions.
 * Ensures the user is authenticated and has the 'admin' role before executing
 * the action handler. Returns `fail(401)` when unauthenticated, `fail(403)` when
 * authenticated but not an admin.
 *
 * This is the canonical cross-repo admin guard (identical shape in synapse and
 * sheppakai-mealplanner — sheppakai-budget#437). It checks the DB `role` only.
 * For the superforms-aware variant that also honours the `ADMIN_USER_IDS`
 * bootstrap, use `adminAuthFailure` from `./admin-guard`.
 *
 * @example
 * export const actions = {
 *   restore: requireAdmin(async (event, user) => {
 *     // user is guaranteed to be an authenticated admin here
 *   })
 * };
 */
export function requireAdmin<
	T,
	Params extends Partial<Record<string, string>> = Partial<Record<string, string>>
>(
	handler: (event: RequestEvent<Params>, user: AuthenticatedUser) => Promise<T>
): (event: RequestEvent<Params>) => Promise<T | ReturnType<typeof fail>> {
	return async (event: RequestEvent<Params>) => {
		if (!event.locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}
		if (event.locals.user.role !== 'admin') {
			return fail(403, { error: 'Forbidden' });
		}
		return handler(event, event.locals.user);
	};
}
