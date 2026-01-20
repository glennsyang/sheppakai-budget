import { z } from 'zod';

export const savingsSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(500, 'Description must be at most 500 characters')
		.optional(),
	amount: z.number().positive('Amount must be positive')
});
