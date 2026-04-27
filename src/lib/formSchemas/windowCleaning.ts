import { z } from 'zod';

export const windowCleaningCustomerSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
	address: z
		.string()
		.min(1, 'Address is required')
		.max(200, 'Address must be at most 200 characters'),
	city: z.string().min(1, 'City is required').max(100, 'City must be at most 100 characters'),
	unitNumber: z.string().max(20, 'Unit number must be at most 20 characters').optional(),
	buzzerNumber: z.string().max(20, 'Buzzer number must be at most 20 characters').optional(),
	phoneNumber: z.string().max(20, 'Phone number must be at most 20 characters').optional(),
	notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
});

export const windowCleaningJobSchema = z.object({
	id: z.string().optional(),
	customerId: z.string().min(1, 'Customer is required'),
	jobDate: z
		.string()
		.min(1, 'Date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
	jobTime: z.string().optional(),
	amountCharged: z.number().positive('Amount must be positive'),
	tip: z.number().min(0, 'Tip cannot be negative').default(0),
	durationHours: z.number().positive('Duration must be positive').optional(),
	notes: z.string().max(500, 'Notes must be at most 500 characters').optional()
});

export const restoreCustomerSchema = z.object({
	customerId: z.string().min(1, 'Customer ID is required')
});
