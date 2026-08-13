import { z } from 'zod';

export const apiDashboardQuerySchema = z.object({
	mode: z.enum(['monthly', 'yearly']).optional(),
	month: z.coerce.number().int().min(1).max(12).optional(),
	year: z.coerce.number().int().min(2000).max(2100).optional(),
	view: z.enum(['current', 'full']).optional()
});
