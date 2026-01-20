import { z } from 'zod';

export const transactionSchema = z.object({
	id: z.string().optional(),
	amount: z.number().positive('Amount must be positive'),
	payee: z.string().min(1, 'Payee is required').max(100, 'Payee must be at most 100 characters'),
	notes: z.string().min(1, 'Notes are required').max(800, 'Notes must be at most 800 characters'),
	date: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	categoryId: z.string().min(1, 'Category is required')
});

export const incomeSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
	description: z
		.string()
		.min(1, 'Description is required')
		.max(500, 'Description must be at most 500 characters'),
	date: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	amount: z.number().positive('Amount must be positive')
});
