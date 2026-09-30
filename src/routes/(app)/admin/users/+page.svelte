<script lang="ts">
	import type { UserWithSessions } from '$lib';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import {
		banUserFormContext,
		setPasswordFormContext,
		setUserRoleFormContext
	} from '$lib/contexts';
	import type {
		banUserSchema,
		createUserSchema,
		setPasswordSchema,
		setUserRoleSchema
	} from '$lib/formSchemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { columns } from './columns';
	import CreateUserDialog from './create-user-dialog.svelte';

	interface Props {
		data: {
			usersWithSessions: UserWithSessions[];
			loadError?: string;
			setRoleForm: SuperValidated<z.infer<typeof setUserRoleSchema>>;
			setPasswordForm: SuperValidated<z.infer<typeof setPasswordSchema>>;
			banUserForm: SuperValidated<z.infer<typeof banUserSchema>>;
			createUserForm: SuperValidated<z.infer<typeof createUserSchema>>;
		};
	}

	let { data }: Props = $props();

	// Type guard to ensure role is defined and banned is boolean
	const usersWithSessionsAndRole = $derived(
		data.usersWithSessions.map((user) => ({
			...user,
			role: user.role || 'user',
			banned: Boolean(user.banned),
			banReason: user.banReason ?? null
		}))
	);

	// svelte-ignore state_referenced_locally
	setUserRoleFormContext.set(data.setRoleForm);
	// svelte-ignore state_referenced_locally
	setPasswordFormContext.set(data.setPasswordForm);
	// svelte-ignore state_referenced_locally
	banUserFormContext.set(data.banUserForm);
</script>

<svelte:head>
	<title>User Management</title>
</svelte:head>

<div class="space-y-4">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h2 class="text-2xl font-bold">User Management</h2>
			<p class="text-muted-foreground">Manage user accounts, roles, and permissions</p>
		</div>
		<CreateUserDialog data={data.createUserForm} />
	</div>

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		<DataTable {columns} data={usersWithSessionsAndRole} />
	{/if}
</div>
