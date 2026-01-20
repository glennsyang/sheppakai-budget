import { z } from 'zod';

export const transactionSchema = z.object({
	id: z.string().optional(),
	amount: z.number().positive('Amount must be positive'),
	payee: z.string().min(1, 'Payee is required'),
	notes: z.string().min(1, 'Notes are required'),
	date: z.string().min(1, 'Date is required'),
	categoryId: z.string().min(1, 'Category is required')
});

export const incomeSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	date: z.string().min(1, 'Date is required'),
	amount: z.number().positive('Amount must be positive')
});
