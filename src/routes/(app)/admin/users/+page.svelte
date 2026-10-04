<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import {
		banUserFormContext,
		setPasswordFormContext,
		setUserRoleFormContext
	} from '$lib/contexts';

	import type { PageProps } from './$types';
	import { columns } from './columns';
	import CreateUserDialog from './create-user-dialog.svelte';

	let { data }: PageProps = $props();

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
	<title>Users · Admin</title>
</svelte:head>

<SectionHeader title="Users" description="Accounts, roles and access">
	{#snippet actions()}
		<CreateUserDialog data={data.createUserForm} />
	{/snippet}
</SectionHeader>

{#if data.loadError}
	<LoadErrorBanner message={data.loadError} />
{:else}
	<DataTable
		{columns}
		data={usersWithSessionsAndRole}
		searchPlaceholder="Search users…"
		emptyMessage="No users yet."
	/>
{/if}
