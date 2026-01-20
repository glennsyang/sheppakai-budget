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

export const savingsGoalSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(500, 'Description must be at most 500 characters')
		.optional(),
	targetAmount: z.number().positive('Target amount must be positive'),
	targetDate: z
		.string()
		.min(1, 'Target date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	status: z.enum(['active', 'completed', 'paused']).default('active')
});

export const contributionSchema = z.object({
	id: z.string().optional(),
	goalId: z.string().min(1, 'Goal ID is required'),
	amount: z.number().positive('Amount must be positive'),
	date: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(500, 'Description must be at most 500 characters')
		.optional()
});

export const deleteSchema = z.object({
	id: z.string().min(1, 'ID is required')
});
