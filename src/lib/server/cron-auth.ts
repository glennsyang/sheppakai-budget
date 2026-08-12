import { createHash, timingSafeEqual } from 'node:crypto';

import { parseBearerToken, type BearerTokenFailureReason } from './http/bearer-token';

const MIN_CRON_SECRET_LENGTH = 32;

type CronAuthFailureReason =
	| 'missing_secret'
	| 'blank_secret'
	| 'weak_secret'
	| BearerTokenFailureReason
	| 'token_mismatch';

type CronAuthResult = { authorized: true } | { authorized: false; reason: CronAuthFailureReason };

function validateCronSecret(
	secret: string | undefined
): { authorized: true; secret: string } | { authorized: false; reason: CronAuthFailureReason } {
	if (secret === undefined) {
		return { authorized: false, reason: 'missing_secret' };
	}

	if (secret.trim().length === 0) {
		return { authorized: false, reason: 'blank_secret' };
	}

	if (secret.length < MIN_CRON_SECRET_LENGTH) {
		return { authorized: false, reason: 'weak_secret' };
	}

	return { authorized: true, secret };
}

function constantTimeTokenMatch(providedToken: string, expectedToken: string): boolean {
	const providedHash = createHash('sha256').update(providedToken).digest();
	const expectedHash = createHash('sha256').update(expectedToken).digest();
	return timingSafeEqual(providedHash, expectedHash);
}

export function verifyCronAuthorization(
	header: string | null,
	configuredSecret: string | undefined
): CronAuthResult {
	const secretValidation = validateCronSecret(configuredSecret);
	if (!secretValidation.authorized) {
		return secretValidation;
	}

	const parsedHeader = parseBearerToken(header);
	if (!parsedHeader.token) {
		return { authorized: false, reason: parsedHeader.reason ?? 'malformed_header' };
	}

	if (!constantTimeTokenMatch(parsedHeader.token, secretValidation.secret)) {
		return { authorized: false, reason: 'token_mismatch' };
	}

	return { authorized: true };
}
