import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { banUserSchema, setPasswordSchema, setUserRoleSchema } from '$lib/formSchemas';
import { auth } from '$lib/server/auth';
import { logger } from '$lib/server/logger';
import type { UserWithSessions } from '$lib/types';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	// Initialize all forms with unique IDs
	const setRoleForm = await superValidate(zod4(setUserRoleSchema), { id: 'setUserRole' });
	const setPasswordForm = await superValidate(zod4(setPasswordSchema), { id: 'setPassword' });
	const banUserForm = await superValidate(zod4(banUserSchema), { id: 'banUser' });

	try {
		// List all users using better-auth admin API
		const result = await auth.api.listUsers({
			query: {
				limit: 100,
				sortBy: 'name',
				sortDirection: 'desc'
			},
			// This endpoint requires session cookies.
			headers: request.headers
		});

		if (!result || !result.users) {
			return {
				usersWithSessions: [],
				setRoleForm,
				setPasswordForm,
				banUserForm
			};
		}

		// Loop through all the users and get their user sessions
		const usersWithSessions: UserWithSessions[] = await Promise.all(
			result.users.map(async (user) => {
				try {
					const sessionsResult = await auth.api.listUserSessions({
						body: { userId: user.id },
						headers: request.headers
					});
					return {
						...user,
						sessions: sessionsResult.sessions || []
					};
				} catch (error) {
					logger.error(`Failed to get sessions for user ${user.id}:`, error);
					return {
						...user,
						sessions: []
					};
				}
			})
		);

		return {
			usersWithSessions,
			setRoleForm,
			setPasswordForm,
			banUserForm
		};
	} catch (error) {
		logger.error('Failed to load users:', error);
		return {
			usersWithSessions: [],
			setRoleForm,
			setPasswordForm,
			banUserForm
		};
	}
};

export const actions: Actions = {
	setRole: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(setUserRoleSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await auth.api.setRole({
				body: {
					userId: form.data.userId,
					role: form.data.role as 'user' | 'admin'
				},
				headers: request.headers
			});

			logger.info(`Set role updated successfully`);
			return { success: true, form };
		} catch (error) {
			logger.error('Failed to set role:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to set user role'
				},
				{ status: 400 }
			);
		}
	},

	setPassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(setPasswordSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await auth.api.setUserPassword({
				body: {
					userId: form.data.userId,
					newPassword: form.data.newPassword
				},
				headers: request.headers
			});

			logger.info(`Set password successfully`);
			return { success: true, form };
		} catch (error) {
			logger.error('Failed to set password:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to set user password'
				},
				{ status: 400 }
			);
		}
	},

	banUser: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const form = await superValidate(request, zod4(banUserSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await auth.api.banUser({
				body: {
					userId: form.data.userId,
					banReason: form.data.banReason
				},
				headers: request.headers
			});

			logger.info(`User banned successfully`);
			return { success: true, form };
		} catch (error) {
			logger.error('Failed to ban user:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to ban user'
				},
				{ status: 400 }
			);
		}
	},

	unbanUser: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const userId = locals.user.id;

		try {
			await auth.api.unbanUser({
				body: {
					userId
				},
				headers: request.headers
			});

			logger.info(`User unbanned successfully`);
			return { success: true };
		} catch (error) {
			logger.error('Failed to unban user:', error);
			return fail(400, { error: 'Failed to unban user' });
		}
	},

	revokeSession: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const userId = locals.user.id;

		try {
			// Revoke all sessions for the user
			await auth.api.revokeUserSessions({
				body: {
					userId
				},
				headers: request.headers
			});

			logger.info(`User sessions revoked successfully`);
			return { success: true };
		} catch (error) {
			logger.error('Failed to revoke sessions:', error);
			return fail(400, { error: 'Failed to revoke sessions' });
		}
	},

	deleteUser: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		const userId = locals.user.id;

		try {
			await auth.api.removeUser({
				body: {
					userId
				},
				headers: request.headers
			});

			return { success: true };
		} catch (error) {
			logger.error('Failed to delete user:', error);
			return fail(400, { error: 'Failed to delete user' });
		}
	}
};
