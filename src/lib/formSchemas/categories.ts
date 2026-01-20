import { z } from 'zod';

export const categorySchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(300, 'Description must be at most 300 characters')
});
