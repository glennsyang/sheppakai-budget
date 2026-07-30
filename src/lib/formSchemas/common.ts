import { z } from 'zod';

/**
 * Id-only payload, used by actions whose entire input is the record to act on —
 * notably the default `deleteSchema` in `src/lib/server/actions/crud-helpers.ts`.
 */
export const idSchema = z.object({
	id: z.string().min(1, 'ID is required')
});
