import { fail } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null
		};
	}

	// Get the full user data including updatedAt
	const fullUserData = await getDb().query.user.findFirst({
		where: eq(user.id, locals.user.id)
	});

	return {
		user: fullUserData || locals.user
	};
};

export const actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const firstName = data.get('firstName')?.toString();
		const lastName = data.get('lastName')?.toString();

		try {
			await getDb()
				.update(user)
				.set({
					firstName: firstName || null,
					lastName: lastName || null,
					updatedAt: new Date().toISOString()
				})
				.where(eq(user.id, locals.user.id));

			console.log('Updated user profile:', locals.user.id);
		} catch (error) {
			console.error('Error updating user profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}

		return { success: true, message: 'Profile updated successfully' };
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const currentPassword = data.get('currentPassword')?.toString();
		const newPassword = data.get('newPassword')?.toString();
		const confirmPassword = data.get('confirmPassword')?.toString();

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { error: 'All password fields are required' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { error: 'New passwords do not match' });
		}

		if (newPassword.length < 8) {
			return fail(400, { error: 'New password must be at least 8 characters long' });
		}

		try {
			// Get current user data including hashed password
			const currentUser = await getDb().select().from(user).where(eq(user.id, locals.user.id));

			if (currentUser.length === 0) {
				return fail(404, { error: 'User not found' });
			}

			// Verify current password
			const isCurrentPasswordValid = await bcrypt.compare(
				currentPassword,
				currentUser[0].hashed_password
			);

			if (!isCurrentPasswordValid) {
				return fail(400, { error: 'Current password is incorrect' });
			}

			// Hash new password
			const hashedNewPassword = await bcrypt.hash(newPassword, 10);

			// Update password in database
			await getDb()
				.update(user)
				.set({
					hashed_password: hashedNewPassword,
					updatedAt: new Date().toISOString()
				})
				.where(eq(user.id, locals.user.id));

			console.log('Updated password for user:', locals.user.id);
		} catch (error) {
			console.error('Error changing password:', error);
			return fail(500, { error: 'Failed to change password' });
		}

		return { success: true, message: 'Password changed successfully' };
	}
} satisfies Actions;
