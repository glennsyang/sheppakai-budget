<script lang="ts">
	import { navigating } from '$app/state';
	import type { UserWithSessions } from '$lib';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import {
		banUserFormContext,
		setPasswordFormContext,
		setUserRoleFormContext
	} from '$lib/contexts';
	import { banUserSchema, setPasswordSchema, setUserRoleSchema } from '$lib/formSchemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { columns } from './columns';

	interface Props {
		data: {
			usersWithSessions: UserWithSessions[];
			loadError?: string;
			setRoleForm: SuperValidated<z.infer<typeof setUserRoleSchema>>;
			setPasswordForm: SuperValidated<z.infer<typeof setPasswordSchema>>;
			banUserForm: SuperValidated<z.infer<typeof banUserSchema>>;
		};
	}

	let { data }: Props = $props();

	const loading = $derived(navigating.to !== null);

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
	<div>
		<h2 class="text-2xl font-bold">User Management</h2>
		<p class="text-muted-foreground">Manage user accounts, roles, and permissions</p>
	</div>

	{#if loading}
		<TableSkeleton rows={5} columns={6} />
	{:else if data.loadError}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm"
		>
			{data.loadError}
		</div>
	{:else}
		<DataTable {columns} data={usersWithSessionsAndRole} />
	{/if}
</div>
