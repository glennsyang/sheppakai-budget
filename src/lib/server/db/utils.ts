import { randomUUID } from 'node:crypto';

// Helper function to generate a UUID for new records
export const generateId = () => randomUUID();

/**
 * Add audit fields (createdBy, updatedBy) to new records
 * @param data Original data object
 * @param userId Current user ID
 */
export function withAuditFieldsForCreate<T extends Record<string, unknown>>(
	data: T,
	userId: string
): T & { createdBy: string; updatedBy: string } {
	return {
		...data,
		createdBy: userId,
		updatedBy: userId
	};
}

/**
 * Add audit fields (updatedBy, updatedAt) to updated records
 * @param data Original data object
 * @param userId Current user ID
 */
export function withAuditFieldsForUpdate<T extends Record<string, unknown>>(
	data: T,
	userId: string
): T & { updatedBy: string; updatedAt: string } {
	// Import getCurrentUTCTimestamp inline to avoid circular dependency
	const getCurrentUTCTimestamp = () => new Date().toISOString().replace('T', ' ').split('.')[0];

	return {
		...data,
		updatedBy: userId,
		updatedAt: getCurrentUTCTimestamp()
	};
}
