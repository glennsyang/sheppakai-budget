import { z } from 'zod';

export const dashboardVisibilitySchema = z.object({
	hiddenSections: z.array(z.string()).default([])
});
