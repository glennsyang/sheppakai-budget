import { z } from 'zod';

// Canonical password rule for reset/set-password: length-only, per NIST SP 800-63B §5.1.1.2
// (composition rules deliberately omitted). Matches minPasswordLength in src/lib/server/auth.ts.
export const passwordSchema = z.string().min(12, 'Password must be at least 12 characters');

export const signInSchema = z.object({
	email: z.email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required')
});

export const resendVerificationSchema = z.object({
	email: z.email('Please enter a valid email address')
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

// No password field: the server generates a throwaway one and the user sets their own
// from the welcome email's set-password link.
export const createUserSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, 'Name is required')
		.max(100, 'Name must be at most 100 characters'),
	email: z.email('Please enter a valid email address'),
	role: z.enum(['user', 'admin']).default('user')
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
