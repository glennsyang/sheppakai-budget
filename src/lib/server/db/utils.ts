/**
 * Add audit fields (created_by, updated_by) to new records
 * @param data Original data object
 * @param userId Current user ID
 */
export function withAuditFieldsForCreate<T extends Record<string, unknown>>(
	data: T,
	userId: string
): T & { created_by: string; updated_by: string } {
	return {
		...data,
		created_by: userId,
		updated_by: userId
	};
}

/**
 * Add audit fields (updated_by, updated_at) to updated records
 * @param data Original data object
 * @param userId Current user ID
 */
export function withAuditFieldsForUpdate<T extends Record<string, unknown>>(
	data: T,
	userId: string
): T & { updated_by: string; updated_at: string } {
	return {
		...data,
		updated_by: userId,
		updated_at: new Date().toISOString()
	};
}
