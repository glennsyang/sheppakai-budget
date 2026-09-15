import { z } from 'zod';

// The recurring entry's id comes from the URL path param, not the body — this schema
// only covers the paid/unpaid toggle payload itself.
export const apiMarkRecurringPaidSchema = z.object({
	paid: z.boolean()
});
