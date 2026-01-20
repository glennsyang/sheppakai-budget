import { randomUUID } from 'node:crypto';

// Use the user type from App.Locals to match the actual user object
type AuthenticatedUser = NonNullable<App.Locals['user']>;

// Helper function to generate a UUID for new records
export const generateId = () => randomUUID();

/**
 * Add audit fields (createdBy, updatedBy) to new records
 * @param data Original data object
 * @param user Current user object
 */
export function withAuditFieldsForCreate<T extends Record<string, unknown>>(
	data: T,
	user: AuthenticatedUser
): T & { createdBy: string; updatedBy: string } {
	const userId = user.id.toString();
	return {
		...data,
		createdBy: userId,
		updatedBy: userId
	};
}

/**
 * Add audit fields (updatedBy, updatedAt) to updated records
 * @param data Original data object
 * @param user Current user object
 */
export function withAuditFieldsForUpdate<T extends Record<string, unknown>>(
	data: T,
	user: AuthenticatedUser
): T & { updatedBy: string; updatedAt: string } {
	// Import getCurrentUTCTimestamp inline to avoid circular dependency
	const getCurrentUTCTimestamp = () => new Date().toISOString().replace('T', ' ').split('.')[0];
	const userId = user.id.toString();

	return {
		...data,
		updatedBy: userId,
		updatedAt: getCurrentUTCTimestamp()
	};
}
