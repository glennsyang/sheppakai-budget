import { permissionsForScope, type ApiScope } from '$lib/api-scopes';
import { userQueries } from '$lib/server/db/queries';
import { parseBearerToken } from '$lib/server/http/bearer-token';
import { logger } from '$lib/server/logger';

import { isAdminUser, isBanActive } from '../admin-status';
import { auth } from '../auth';
import type { ApiErrorCode } from './response';

type ApiKeyAuthSuccess = { ok: true; apiKeyId: string; userId: string };
type ApiKeyAuthFailure = { ok: false; status: 401 | 429; code: ApiErrorCode; message: string };
export type ApiKeyAuthResult = ApiKeyAuthSuccess | ApiKeyAuthFailure;

// The api-key plugin folds a rate-limited verification and an out-of-quota key into
// these two codes (see node_modules/@better-auth/api-key's verifyApiKey handler);
// everything else (unknown key, disabled, expired, or a scope the key doesn't have)
// comes back as a generic invalid-key failure, deliberately not distinguishable from
// each other so a caller can't probe which reason applies to a given key.
const RATE_LIMIT_ERROR_CODES = new Set(['RATE_LIMITED', 'USAGE_EXCEEDED']);

/**
 * Authenticates an external `/api/v1/*` request against an API key. Reads only the
 * `Authorization: Bearer <key>` header — never a query string, never `event.locals` —
 * so this is a fully separate auth path from session-cookie auth, by design: a valid
 * session must never grant access to `/api/v1/*`, and a valid API key must never grant
 * access to session-only routes.
 */
export async function requireApiKey(request: Request, scope: ApiScope): Promise<ApiKeyAuthResult> {
	const path = new URL(request.url).pathname;
	const parsed = parseBearerToken(request.headers.get('authorization'));

	if (parsed.reason) {
		logger.warn('API key auth failed', { path, reason: parsed.reason });
		return {
			ok: false,
			status: 401,
			code: parsed.reason,
			message: 'Missing or malformed Authorization header. Use "Authorization: Bearer <key>".'
		};
	}

	const result = await auth.api.verifyApiKey({
		body: { key: parsed.token, permissions: permissionsForScope(scope) }
	});

	if (!result.valid || !result.key) {
		const errorCode = result.error?.code;
		logger.warn('API key auth failed', { path, reason: errorCode ?? 'invalid_api_key' });

		if (errorCode !== undefined && RATE_LIMIT_ERROR_CODES.has(errorCode)) {
			return {
				ok: false,
				status: 429,
				code: 'rate_limited',
				message: 'Rate limit exceeded for this API key. Try again later.'
			};
		}

		return {
			ok: false,
			status: 401,
			code: 'invalid_api_key',
			message: 'Invalid API key.'
		};
	}

	// The plugin only checks the key row itself (enabled, expiry, scope, rate limit), never
	// its owner. Keys are minted only from the admin page, so a key is live only while its
	// owner still exists, is not banned, and is still an admin — otherwise a banned or
	// demoted admin's keys would keep working until they expire (up to 365 days).
	const owner = await userQueries.findById(result.key.referenceId, false);
	if (!owner || isBanActive(owner) || !isAdminUser(owner)) {
		logger.warn('API key auth failed', {
			path,
			reason: !owner ? 'owner_not_found' : isBanActive(owner) ? 'owner_banned' : 'owner_not_admin',
			apiKeyId: result.key.id
		});
		return {
			ok: false,
			status: 401,
			code: 'invalid_api_key',
			message: 'Invalid API key.'
		};
	}

	return { ok: true, apiKeyId: result.key.id, userId: result.key.referenceId };
}
