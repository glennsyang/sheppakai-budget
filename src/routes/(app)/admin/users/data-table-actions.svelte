<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import type { SessionWithImpersonatedBy } from 'better-auth/plugins';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		banUserFormContext,
		setPasswordFormContext,
		setUserRoleFormContext
	} from '$lib/contexts';
	import type { banUserSchema, setPasswordSchema, setUserRoleSchema } from '$lib/formSchemas';
	import { formatLocalTimestamp } from '$lib/utils/dates';

	import type { UserWithSessions } from '$lib';

	let { user }: { user: UserWithSessions } = $props();

	let openSetRoleDialog = $state<boolean>(false);
	let openSetPasswordDialog = $state<boolean>(false);
	let openBanDialog = $state<boolean>(false);
	let openUnbanDialog = $state<boolean>(false);
	let openRevokeDialog = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
	let openSessionsSheet = $state<boolean>(false);

	// Get all forms contexts
	const setUserRoleForm = setUserRoleFormContext.get() as SuperValidated<
		z.infer<typeof setUserRoleSchema>
	>;
	const setPasswordFormData = setPasswordFormContext.get() as SuperValidated<
		z.infer<typeof setPasswordSchema>
	>;
	const banUserFormData = banUserFormContext.get() as SuperValidated<z.infer<typeof banUserSchema>>;

	// Create separate superForm instances for each form
	// Use dynamic IDs per user to avoid duplicates across table rows
	const {
		form: setRoleForm,
		errors: setRoleErrors,
		enhance: setRoleEnhance,
		message: setRoleMessage,
		submitting: setRoleSubmitting
	} = superForm(setUserRoleForm, {
		// svelte-ignore state_referenced_locally
		id: `setUserRole-${user.id}`,
		resetForm: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				openSetRoleDialog = false;
				toast.success('User role updated successfully');
			}
			if ($setRoleMessage?.type === 'error') {
				toast.error(`Error: ${$setRoleMessage.text}`);
			}
		},
		onError: ({ result }) => {
			toast.error(`Error updating role: ${result.error.message}`);
		}
	});

	const {
		form: setPasswordForm,
		errors: setPasswordErrors,
		enhance: setPasswordEnhance,
		message: setPasswordMessage,
		submitting: setPasswordSubmitting
	} = superForm(setPasswordFormData, {
		// svelte-ignore state_referenced_locally
		id: `setPassword-${user.id}`,
		resetForm: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				openSetPasswordDialog = false;
				toast.success('Password updated successfully');
			}
			if ($setPasswordMessage?.type === 'error') {
				toast.error(`Error: ${$setPasswordMessage.text}`);
			}
		},
		onError: ({ result }) => {
			toast.error(`Error updating password: ${result.error.message}`);
		}
	});

	const {
		form: banUserForm,
		errors: banUserErrors,
		enhance: banUserEnhance,
		message: banUserMessage,
		submitting: banUserSubmitting
	} = superForm(banUserFormData, {
		// svelte-ignore state_referenced_locally
		id: `banUser-${user.id}`,
		resetForm: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				openBanDialog = false;
				toast.success('User banned successfully');
			}
			if ($banUserMessage?.type === 'error') {
				toast.error(`Error: ${$banUserMessage.text}`);
			}
		},
		onError: ({ result }) => {
			toast.error(`Error banning user: ${result.error.message}`);
		}
	});

	// Update selectedRole when dialog opens
	$effect(() => {
		if (openSetRoleDialog) {
			$setRoleForm.userId = user.id;
			$setRoleForm.role = user.role || 'user';
		}
	});

	$effect(() => {
		if (openSetPasswordDialog) {
			$setPasswordForm.userId = user.id;
			$setPasswordForm.newPassword = '';
		}
	});

	$effect(() => {
		if (openBanDialog) {
			$banUserForm.userId = user.id;
			$banUserForm.banReason = '';
		}
	});

	// Derived value for active session count
	let activeSessionCount = $derived(
		user.sessions?.filter((s) => new Date(s.expiresAt) > new Date()).length || 0
	);

	// Helper function to check if session is active
	function isSessionActive(session: SessionWithImpersonatedBy): boolean {
		return new Date(session.expiresAt) > new Date();
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => (openSetRoleDialog = true)}>Set Role</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (openSetPasswordDialog = true)}>
			Set Password
		</DropdownMenu.Item>
		{#if user.banned}
			<DropdownMenu.Item onclick={() => (openUnbanDialog = true)}>Unban User</DropdownMenu.Item>
		{:else}
			<DropdownMenu.Item onclick={() => (openBanDialog = true)}>Ban User</DropdownMenu.Item>
		{/if}
		<DropdownMenu.Item onclick={() => (openSessionsSheet = true)}>List Sessions</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (openRevokeDialog = true)}>Revoke Sessions</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (openDeleteModal = true)}>Delete User</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Set Role Dialog -->
<Dialog.Root bind:open={openSetRoleDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Set User Role</Dialog.Title>
			<Dialog.Description>Change the role for {user.email}</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/admin/users?/setRole" use:setRoleEnhance>
			<input type="hidden" name="userId" bind:value={$setRoleForm.userId} />

			<div class="space-y-2">
				<label for="user-role">Role</label>
				<Select.Root type="single" bind:value={$setRoleForm.role} required>
					<Select.Trigger class="w-full {$setRoleErrors.role ? 'border-red-400' : ''}">
						{$setRoleForm.role.charAt(0).toUpperCase() + $setRoleForm.role.slice(1)}
					</Select.Trigger>
					<Select.Content>
						<Select.Label>Select Role</Select.Label>
						<Select.Item value="user" label="User">User</Select.Item>
						<Select.Item value="admin" label="Admin">Admin</Select.Item>
					</Select.Content>
				</Select.Root>
				{#if $setRoleErrors.role}
					<p class="text-sm text-red-500">{$setRoleErrors.role}</p>
				{/if}
				<input type="hidden" name="role" value={$setRoleForm.role} />
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$setRoleSubmitting}>
					{$setRoleSubmitting ? 'Saving...' : 'Set Role'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Set Password Dialog -->
<Dialog.Root bind:open={openSetPasswordDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Set User Password</Dialog.Title>
			<Dialog.Description>Set a new password for {user.email}</Dialog.Description>
		</Dialog.Header>
		<form class="space-y-4" method="POST" action="/admin/users?/setPassword" use:setPasswordEnhance>
			<input type="hidden" name="userId" bind:value={$setPasswordForm.userId} />

			<div class="space-y-2">
				<label for="newPassword">New Password</label>
				<Input
					id="newPassword"
					name="newPassword"
					type="password"
					bind:value={$setPasswordForm.newPassword}
					class={$setPasswordErrors.newPassword ? 'border-red-400' : ''}
					required
					minlength={12}
					placeholder="Enter new password (min 12 characters)"
				/>
				{#if $setPasswordErrors.newPassword}
					<p class="text-sm text-red-500">{$setPasswordErrors.newPassword}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$setPasswordSubmitting}>
					{$setPasswordSubmitting ? 'Updating...' : 'Update Password'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Ban User Dialog -->
<Dialog.Root bind:open={openBanDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Ban User</Dialog.Title>
			<Dialog.Description>Ban {user.email} from the application</Dialog.Description>
		</Dialog.Header>
		<form class="space-y-4" method="POST" action="/admin/users?/banUser" use:banUserEnhance>
			<input type="hidden" name="userId" bind:value={$banUserForm.userId} />

			<div class="space-y-2">
				<label for="banReason">Reason (optional)</label>
				<Input
					id="banReason"
					name="banReason"
					type="text"
					bind:value={$banUserForm.banReason}
					class={$banUserErrors.banReason ? 'border-red-400' : ''}
					placeholder="Enter ban reason"
					required
				/>
				{#if $banUserErrors.banReason}
					<p class="text-sm text-red-500">{$banUserErrors.banReason}</p>
				{/if}
			</div>

			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$banUserSubmitting}>
					{$banUserSubmitting ? 'Updating...' : 'Ban User'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Unban User Confirmation -->
<ConfirmModal
	bind:open={openUnbanDialog}
	id={user.id}
	actionUrl="/admin/users?/unbanUser"
	title="Unban User"
	message="Are you sure you want to unban {user.email}?"
	confirmButtonText="Unban User"
/>

<!-- Revoke Sessions Confirmation -->
<ConfirmModal
	bind:open={openRevokeDialog}
	id={user.id}
	actionUrl="/admin/users?/revokeSession"
	title="Revoke Session"
	message="Are you sure you want to permanently revoke all sessions for {user.email}? This action cannot be undone."
	confirmButtonText="Revoke Session"
/>

<!-- Delete User Confirmation -->
<ConfirmModal
	bind:open={openDeleteModal}
	id={user.id}
	actionUrl="/admin/users?/deleteUser"
	title="Delete User"
	message="Are you sure you want to permanently delete {user.email}? This action cannot be undone."
	confirmButtonText="Delete User"
/>

<!-- Sessions Sheet -->
<Sheet.Root bind:open={openSessionsSheet}>
	<Sheet.Content side="right" class="flex w-full flex-col sm:max-w-lg">
		<Sheet.Header>
			<Sheet.Title>User Sessions</Sheet.Title>
			<Sheet.Description>
				Active and expired sessions for {user.email}
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 overflow-y-auto px-4 py-4">
			{#if !user.sessions || user.sessions.length === 0}
				<div class="flex h-32 items-center justify-center text-muted-foreground">
					No sessions found
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Status</Table.Head>
							<Table.Head>IP Address</Table.Head>
							<Table.Head>Created</Table.Head>
							<Table.Head>Expires</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each user.sessions as session (session.id)}
							<Table.Row>
								<Table.Cell>
									{#if isSessionActive(session)}
										<Badge variant="default" class="bg-green-500">Active</Badge>
									{:else}
										<Badge variant="destructive">Expired</Badge>
									{/if}
								</Table.Cell>
								<Table.Cell class="font-mono text-xs">
									{session.ipAddress || 'N/A'}
								</Table.Cell>
								<Table.Cell class="text-xs">
									{formatLocalTimestamp(new Date(session.createdAt).toISOString())}
								</Table.Cell>
								<Table.Cell class="text-xs">
									{formatLocalTimestamp(new Date(session.expiresAt).toISOString())}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</div>

		<Sheet.Footer class="border-t pt-4">
			<div class="flex w-full justify-between text-sm font-medium">
				<span>{user.sessions?.length || 0} total sessions</span>
				<span>{activeSessionCount} active</span>
			</div>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
