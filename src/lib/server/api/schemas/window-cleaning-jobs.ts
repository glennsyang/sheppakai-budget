import { windowCleaningJobSchema } from '$lib/formSchemas';
import { z } from 'zod';

// Reuses the field rules the job form action already validates against. `id` is
// server-generated, never accepted from the client.
export const apiCreateWindowCleaningJobSchema = windowCleaningJobSchema.omit({ id: true });

export const apiWindowCleaningJobListQuerySchema = z
	.object({
		customerId: z.string().min(1).optional(),
		month: z.coerce.number().int().min(1).max(12).optional(),
		year: z.coerce.number().int().min(2000).max(2100).optional()
	})
	.refine((query) => !query.month || !!query.year, {
		message: 'year is required when month is given',
		path: ['year']
	});
