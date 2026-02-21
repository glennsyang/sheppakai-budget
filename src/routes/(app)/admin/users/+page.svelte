<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import {
		banUserFormContext,
		setPasswordFormContext,
		setUserRoleFormContext
	} from '$lib/contexts';
	import { banUserSchema, setPasswordSchema, setUserRoleSchema } from '$lib/formSchemas';

	import { columns } from './columns';

	import type { UserWithSessions } from '$lib';

	interface Props {
		data: {
			usersWithSessions: UserWithSessions[];
			setRoleForm: SuperValidated<z.infer<typeof setUserRoleSchema>>;
			setPasswordForm: SuperValidated<z.infer<typeof setPasswordSchema>>;
			banUserForm: SuperValidated<z.infer<typeof banUserSchema>>;
		};
	}

	let { data }: Props = $props();

	let loading = $state<boolean>(false);

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
	{:else}
		<DataTable {columns} data={usersWithSessionsAndRole} />
	{/if}
</div>
