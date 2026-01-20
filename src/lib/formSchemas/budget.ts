import { z } from 'zod';

export const budgetSchema = z.object({
	id: z.string().optional(),
	amount: z.number().positive('Amount must be positive'),
	month: z
		.string()
		.min(1, 'Month is required')
		.regex(/^\d{2}$/, 'Month must be in MM format (01-12)')
		.refine((val) => {
			const month = parseInt(val);
			return month >= 1 && month <= 12;
		}, 'Month must be between 01 and 12'),
	year: z
		.string()
		.min(4, 'Year is required')
		.regex(/^\d{4}$/, 'Year must be in YYYY format')
		.refine((val) => {
			const year = parseInt(val);
			return year >= 2000 && year <= 2100;
		}, 'Year must be between 2000 and 2100'),
	categoryId: z.string().min(1, 'Category is required'),
	presetType: z.enum(['lastMonth', 'lastMonthBudget', 'average', 'custom']).nullable().optional()
});
