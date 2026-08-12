import { transactionSchema } from '$lib/formSchemas';
import { z } from 'zod';

// Reuses the field rules (amount positivity, payee/notes length, date format) the form
// action already validates against, so the API and the UI can't drift on what counts as
// a valid transaction. `id` is server-generated, never accepted from the client.
export const apiCreateTransactionSchema = transactionSchema.omit({ id: true });

const dateParam = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD');

export const apiTransactionListQuerySchema = z
	.object({
		startDate: dateParam.optional(),
		endDate: dateParam.optional(),
		categoryId: z.string().min(1).optional(),
		// Bounds the no-date-range case so a bare GET can't dump the whole table.
		limit: z.coerce.number().int().min(1).max(200).default(50)
	})
	.refine(
		(query) => (!query.startDate && !query.endDate) || (!!query.startDate && !!query.endDate),
		{
			message: 'startDate and endDate must be provided together',
			path: ['startDate']
		}
	);
