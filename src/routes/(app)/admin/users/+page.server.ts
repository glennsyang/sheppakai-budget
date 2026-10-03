import { randomBytes } from 'node:crypto';

import {
	banUserSchema,
	createUserSchema,
	setPasswordSchema,
	setUserRoleSchema,
	userIdSchema
} from '$lib/formSchemas';
import { adminFormAction } from '$lib/server/actions/admin-guard';
import { isAdminUser } from '$lib/server/admin-status';
import { assertAdmin, auth } from '$lib/server/auth';
import { allowlistCommandFor, isEmailAllowlisted, sendWelcome } from '$lib/server/auth/welcome';
import { disableApiKeysForUser } from '$lib/server/db/writes/api-keys';
import { logger } from '$lib/server/logger';
import { sendAuthAlerts } from '$lib/server/notifications';
import type { UserWithSessions } from '$lib/types';
import { getBetterAuthErrorCode, getBetterAuthErrorMessage } from '$lib/utils';
import { isRedirect } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { Actions, PageServerLoad } from './$types';

/**
 * Disables a user's API keys after a ban or demotion. `requireApiKey` already rejects keys
 * whose owner is banned or no longer an admin; this makes the change stick, so unbanning or
 * re-promoting the user later doesn't quietly bring the old keys back. Returns false when
 * the disable failed, so the action can report it instead of claiming full success.
 */
async function disableKeysAfter(action: 'ban' | 'demotion', userId: string): Promise<boolean> {
	try {
		const count = await disableApiKeysForUser(userId);
		if (count > 0) {
			logger.info(`Disabled API keys after ${action}`, { userId, count });
		}
		return true;
	} catch (error) {
		logger.error(`Failed to disable API keys after ${action}`, {
			userId,
			error
		});
		return false;
	}
}

export const load: PageServerLoad = async ({ request, locals }) => {
	assertAdmin(locals);

	// Initialize all forms with unique IDs
	const setRoleForm = await superValidate(zod4(setUserRoleSchema), {
		id: 'setUserRole'
	});
	const setPasswordForm = await superValidate(zod4(setPasswordSchema), {
		id: 'setPassword'
	});
	const banUserForm = await superValidate(zod4(banUserSchema), {
		id: 'banUser'
	});
	const createUserForm = await superValidate(zod4(createUserSchema), {
		id: 'createUser'
	});

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

		if (!result?.users) {
			return {
				usersWithSessions: [],
				loadError: 'Failed to retrieve user list from the auth provider.',
				setRoleForm,
				setPasswordForm,
				banUserForm,
				createUserForm
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
			banUserForm,
			createUserForm
		};
	} catch (error) {
		logger.error('Failed to load users:', error);
		return {
			usersWithSessions: [],
			loadError: 'Failed to load users. Please try refreshing the page.',
			setRoleForm,
			setPasswordForm,
			banUserForm,
			createUserForm
		};
	}
};

export const actions = {
	createUser: adminFormAction(createUserSchema, async ({ request }, form, user) => {
		let created: { id: string; email: string; name: string };
		try {
			const result = await auth.api.createUser({
				body: {
					name: form.data.name,
					email: form.data.email,
					role: form.data.role,
					// Never shown to anyone: the user sets their own via the welcome email's link.
					password: randomBytes(32).toString('base64url')
				},
				headers: request.headers
			});
			created = result.user;
		} catch (error) {
			if (isRedirect(error)) throw error;
			if (getBetterAuthErrorCode(error) === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
				return message(
					form,
					{ type: 'error', text: 'A user with this email already exists.' },
					{ status: 400 }
				);
			}
			logger.error('Failed to create user:', error);
			return message(
				form,
				{
					type: 'error',
					text: getBetterAuthErrorMessage(error, 'Failed to create user')
				},
				{ status: 500 }
			);
		}

		logger.info('Admin created user', {
			adminId: user.id,
			userId: created.id
		});
		void sendAuthAlerts(
			`New user created by admin: ${created.email}`,
			'Sheppakai Budget - New User Alert',
			4
		);

		// Sign-in is gated by the ALLOWED_EMAILS Fly secret, which the app can't change at
		// runtime. Hold the welcome email until the address is allowlisted, so the user doesn't
		// get instructions that won't work yet.
		if (!isEmailAllowlisted(created.email)) {
			const allowlistCommand = allowlistCommandFor(created.email);
			message(form, {
				type: 'success',
				text: `User created. Welcome email not sent: ${created.email} isn't in ALLOWED_EMAILS yet.`
			});
			return { form, allowlistCommand };
		}

		try {
			await sendWelcome(created);
		} catch (error) {
			logger.error('Failed to send welcome email', {
				userId: created.id,
				error
			});
			return message(
				form,
				{
					type: 'error',
					text: 'User created, but the welcome email failed. Use "Send Welcome Email" to retry.'
				},
				{ status: 500 }
			);
		}

		logger.info('Welcome email sent', { userId: created.id });
		return message(form, {
			type: 'success',
			text: `User created and welcome email sent.`
		});
	}),

	sendWelcomeEmail: adminFormAction(
		userIdSchema,
		async ({ request }, form, admin) => {
			try {
				const user = await auth.api.getUser({
					query: { id: form.data.id },
					headers: request.headers
				});

				if (!isEmailAllowlisted(user.email)) {
					return message(
						form,
						{
							type: 'error',
							text: `${user.email} isn't in ALLOWED_EMAILS yet. Run: ${allowlistCommandFor(user.email)}`
						},
						{ status: 400 }
					);
				}

				await sendWelcome(user);

				logger.info('Welcome email sent', {
					adminId: admin.id,
					userId: user.id
				});
				void sendAuthAlerts(
					`Welcome email resent by admin to: ${user.email}`,
					'Sheppakai Budget - Security Alert',
					3
				);
				return message(form, { type: 'success', text: 'Welcome email sent' });
			} catch (error) {
				if (isRedirect(error)) throw error;
				logger.error('Failed to send welcome email', {
					userId: form.data.id,
					error
				});
				return message(
					form,
					{ type: 'error', text: 'Failed to send welcome email' },
					{ status: 500 }
				);
			}
		},
		{ invalidMessage: 'User ID is required' }
	),

	setRole: adminFormAction(setUserRoleSchema, async ({ request }, form) => {
		try {
			await auth.api.setRole({
				body: {
					userId: form.data.userId,
					role: form.data.role as 'user' | 'admin'
				},
				headers: request.headers
			});

			logger.info(`Set role updated successfully`, {
				userId: form.data.userId
			});

			// A user listed in ADMIN_USER_IDS stays an admin whatever their role, so their keys stay valid.
			const demoted = !isAdminUser({
				id: form.data.userId,
				role: form.data.role
			});
			if (demoted && !(await disableKeysAfter('demotion', form.data.userId))) {
				return message(
					form,
					{
						type: 'error',
						text: 'User role updated, but failed to disable their API keys'
					},
					{ status: 500 }
				);
			}

			return message(form, {
				type: 'success',
				text: 'User role updated successfully'
			});
		} catch (error) {
			logger.error('Failed to set role:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to set user role'
				},
				{ status: 500 }
			);
		}
	}),

	setPassword: adminFormAction(setPasswordSchema, async ({ request }, form) => {
		try {
			await auth.api.setUserPassword({
				body: {
					userId: form.data.userId,
					newPassword: form.data.newPassword
				},
				headers: request.headers
			});

			logger.info(`Set password successfully`, { userId: form.data.userId });
			return message(form, {
				type: 'success',
				text: 'Password updated successfully'
			});
		} catch (error) {
			logger.error('Failed to set password:', error);
			return message(
				form,
				{
					type: 'error',
					text: getBetterAuthErrorMessage(error, 'Failed to set user password')
				},
				{ status: 500 }
			);
		}
	}),

	banUser: adminFormAction(banUserSchema, async ({ request }, form) => {
		try {
			await auth.api.banUser({
				body: {
					userId: form.data.userId,
					banReason: form.data.banReason
				},
				headers: request.headers
			});

			logger.info(`User banned successfully`, { userId: form.data.userId });

			if (!(await disableKeysAfter('ban', form.data.userId))) {
				return message(
					form,
					{
						type: 'error',
						text: 'User banned, but failed to disable their API keys'
					},
					{ status: 500 }
				);
			}

			return message(form, {
				type: 'success',
				text: 'User banned successfully'
			});
		} catch (error) {
			logger.error('Failed to ban user:', error);
			return message(
				form,
				{
					type: 'error',
					text: 'Failed to ban user'
				},
				{ status: 500 }
			);
		}
	}),

	unbanUser: adminFormAction(
		userIdSchema,
		async ({ request }, form) => {
			try {
				await auth.api.unbanUser({
					body: {
						userId: form.data.id
					},
					headers: request.headers
				});

				logger.info(`User unbanned successfully`, { userId: form.data.id });
				return message(form, {
					type: 'success',
					text: 'User unbanned successfully'
				});
			} catch (error) {
				logger.error('Failed to unban user:', error);
				return message(form, { type: 'error', text: 'Failed to unban user' }, { status: 500 });
			}
		},
		{ invalidMessage: 'User ID is required' }
	),

	revokeSession: adminFormAction(
		userIdSchema,
		async ({ request }, form) => {
			try {
				// Revoke all sessions for the user
				await auth.api.revokeUserSessions({
					body: {
						userId: form.data.id
					},
					headers: request.headers
				});

				logger.info(`User sessions revoked successfully`, {
					userId: form.data.id
				});
				return message(form, {
					type: 'success',
					text: 'Sessions revoked successfully'
				});
			} catch (error) {
				logger.error('Failed to revoke sessions:', error);
				return message(form, { type: 'error', text: 'Failed to revoke sessions' }, { status: 500 });
			}
		},
		{ invalidMessage: 'User ID is required' }
	),

	deleteUser: adminFormAction(
		userIdSchema,
		async ({ request }, form) => {
			try {
				await auth.api.removeUser({
					body: {
						userId: form.data.id
					},
					headers: request.headers
				});

				logger.info('User deleted successfully', { userId: form.data.id });
				return message(form, {
					type: 'success',
					text: 'User deleted successfully'
				});
			} catch (error) {
				logger.error('Failed to delete user:', error);
				return message(form, { type: 'error', text: 'Failed to delete user' }, { status: 500 });
			}
		},
		{ invalidMessage: 'User ID is required' }
	)
} satisfies Actions;
