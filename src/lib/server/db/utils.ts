import { randomUUID } from 'node:crypto';

import { getCurrentUTCTimestamp } from '$lib/utils/dates';

// Use the user type from App.Locals to match the actual user object
type AuthenticatedUser = NonNullable<App.Locals['user']>;

// Helper function to generate a UUID for new records
export const generateId = () => randomUUID();

const resolveUserId = (user: AuthenticatedUser | string) =>
	typeof user === 'string' ? user : user.id.toString();

/**
 * Add audit fields (createdBy, updatedBy) to new records
 * @param data Original data object
 * @param user Current user object, or its id
 */
export function withAuditFieldsForCreate<T extends Record<string, unknown>>(
	data: T,
	user: AuthenticatedUser | string
): T & { createdBy: string; updatedBy: string } {
	const userId = resolveUserId(user);
	return {
		...data,
		createdBy: userId,
		updatedBy: userId
	};
}

/**
 * Add audit fields (updatedBy, updatedAt) to updated records
 * @param data Original data object
 * @param user Current user object, or its id
 */
export function withAuditFieldsForUpdate<T extends Record<string, unknown>>(
	data: T,
	user: AuthenticatedUser | string
): T & { updatedBy: string; updatedAt: string } {
	const userId = resolveUserId(user);

	return {
		...data,
		updatedBy: userId,
		updatedAt: getCurrentUTCTimestamp()
	};
}
