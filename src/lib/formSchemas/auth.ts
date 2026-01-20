import { z } from 'zod';

export const signInSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(12, 'Password must be at least 12 characters')
});

export const registerSchema = z
	.object({
		email: z.email('Please enter a valid email address'),
		name: z
			.string()
			.min(2, 'Name must be at least 2 characters')
			.max(100, 'Name must be at most 100 characters'),
		password: z.string().min(12, 'Password must be at least 12 characters'),
		confirmPassword: z.string().min(12, 'Password must be at least 12 characters')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const updateProfileSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters')
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required'),
		newPassword: z.string().min(12, 'New password must be at least 12 characters'),
		confirmPassword: z.string().min(1, 'Please confirm your password')
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});
