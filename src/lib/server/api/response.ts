import { json } from '@sveltejs/kit';

/**
 * JSON-API counterpart to the superforms `message(form, {...}, {status})` contract in
 * docs/ERROR_HANDLING_POLICY.md: exactly one success shape, one error shape, explicit
 * HTTP status, no ad-hoc fourth shape. `/api/v1/*` routes have no superform to attach a
 * message to, so this is the equivalent envelope for plain JSON responses.
 */
export type ApiErrorCode =
	| 'missing_header'
	| 'invalid_scheme'
	| 'malformed_header'
	| 'invalid_api_key'
	| 'rate_limited'
	| 'validation_failed'
	| 'invalid_json'
	| 'internal_error';

export function apiSuccess<T>(data: T, status = 200): Response {
	return json({ data }, { status });
}

export function apiError(code: ApiErrorCode, message: string, status: number): Response {
	return json({ error: { code, message } }, { status });
}
