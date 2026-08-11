import { PASSWORD_ROTATION_DAYS } from '$app/env/private';

/**
 * Whether a password is old enough to require forced rotation.
 * `passwordUpdatedAt` is missing for users without a credential account yet,
 * in which case rotation doesn't apply.
 */
export function isPasswordExpired(passwordUpdatedAt: Date | null | undefined): boolean {
	if (!passwordUpdatedAt) return false;
	const ageMs = Date.now() - new Date(passwordUpdatedAt).getTime();
	return ageMs > PASSWORD_ROTATION_DAYS * 24 * 60 * 60 * 1000;
}
