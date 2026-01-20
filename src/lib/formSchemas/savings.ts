import { z } from 'zod';

export const savingsSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional(),
	amount: z.number().positive('Amount must be positive')
});
