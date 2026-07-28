import { redirect } from '@sveltejs/kit';

/**
 * Type representing an authenticated user from locals
 */
type AuthenticatedUser = NonNullable<App.Locals['user']>;

/**
 * Where unauthenticated visitors are sent.
 */
export const SIGN_IN_ROUTE = '/auth/sign-in';

/**
 * Returns the authenticated user, or redirects to sign-in.
 *
 * Use this in `load` functions, where a redirect is the correct response.
 * Actions should use `requireAuth` from `$lib/server/actions/auth-guard`
 * instead, since they must return a `fail()` rather than redirect.
 *
 * @param locals - The request locals populated by `hooks.server.ts`
 * @returns The authenticated user, narrowed to be non-nullable
 *
 * @example
 * export const load: PageServerLoad = async ({ locals }) => {
 *   const user = requireUser(locals);
 *   // user is guaranteed to be defined here
 * };
 */
export function requireUser(locals: App.Locals): AuthenticatedUser {
	if (!locals.user) {
		throw redirect(302, SIGN_IN_ROUTE);
	}

	return locals.user;
}
