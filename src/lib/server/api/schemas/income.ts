import { incomeSchema } from '$lib/formSchemas';
import { z } from 'zod';

// Reuses the field rules the `income` form action already validates against, so the API
// and the UI can't drift on what counts as valid income. `id` is server-generated, never
// accepted from the client.
export const apiCreateIncomeSchema = incomeSchema.omit({ id: true });

const dateParam = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD');

export const apiIncomeListQuerySchema = z
	.object({
		startDate: dateParam.optional(),
		endDate: dateParam.optional(),
		month: z.coerce.number().int().min(1).max(12).optional(),
		year: z.coerce.number().int().min(2000).max(2100).optional(),
		// Bounds the no-range case so a bare GET can't dump the whole table.
		limit: z.coerce.number().int().min(1).max(200).default(50)
	})
	.refine(
		(query) => (!query.startDate && !query.endDate) || (!!query.startDate && !!query.endDate),
		{
			message: 'startDate and endDate must be provided together',
			path: ['startDate']
		}
	)
	.refine((query) => !query.month || !!query.year, {
		message: 'year is required when month is given',
		path: ['year']
	});
