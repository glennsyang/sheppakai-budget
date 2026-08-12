import { z } from 'zod';

// A `year` is required so the API can't be used to dump the entire budgets table with an
// unqualified GET; `month` is optional so callers can ask for a full year at once.
export const apiBudgetsQuerySchema = z
	.object({
		month: z.coerce.number().int().min(1).max(12).optional(),
		year: z.coerce.number().int().min(2000).max(2100).optional()
	})
	.refine((query) => query.year !== undefined, {
		message: 'year is required',
		path: ['year']
	});
