import { z } from 'zod';

// Canonical password rule for register/reset: mirrors the complexity
// already enforced server-side in hooks.before (src/lib/server/auth.ts), promoted to the Zod
// layer so it's also enforced for reset-password and gives instant client-side feedback.
export const passwordSchema = z
	.string()
	.min(12, 'Password must be at least 12 characters')
	.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
	.regex(/[a-z]/, 'Password must contain at least one lowercase letter')
	.regex(/\d/, 'Password must contain at least one number')
	.regex(
		/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
		'Password must contain at least one special character'
	);

export const signInSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export const resendVerificationSchema = z.object({
	email: z.email('Please enter a valid email address')
});

export const registerSchema = z
	.object({
		email: z.email('Please enter a valid email address'),
		name: z
			.string()
			.min(2, 'Name must be at least 2 characters')
			.max(100, 'Name must be at most 100 characters'),
		password: passwordSchema,
		confirmPassword: passwordSchema
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

export const setUserRoleSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	role: z.string().min(4, 'Role is required').max(5, 'Role must be either user or admin')
});

export const setPasswordSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	newPassword: z.string().min(12, 'New password must be at least 12 characters')
});

export const banUserSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	banReason: z.string().max(500, 'Ban reason must be at most 500 characters')
});

// The admin actions driven by ConfirmModal (unban, revoke sessions, delete) post a single
// `id` field. They validate against this so their failures can carry a message, per
// docs/ERROR_HANDLING_POLICY.md.
export const userIdSchema = z.object({
	id: z.string().min(1, 'User ID is required')
});
