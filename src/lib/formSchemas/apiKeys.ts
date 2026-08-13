import { API_SCOPES } from '$lib/api-scopes';
import { z } from 'zod';

export const createApiKeySchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
	scopes: z.array(z.enum(API_SCOPES)).min(1, 'Select at least one scope'),
	expiresInDays: z.coerce.number().int().min(1).max(365).optional()
});
