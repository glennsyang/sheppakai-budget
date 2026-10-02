<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { setContext } from 'svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	setContext('restoreForm', data.form);
</script>

<svelte:head>
	<title>Admin — Deleted Customers</title>
</svelte:head>

<div class="space-y-4">
	<div>
		<h2 class="text-2xl font-bold">Deleted Customers</h2>
		<p class="text-muted-foreground">View and restore soft-deleted window cleaning customers</p>
	</div>

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else if data.deletedCustomers.length === 0}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No deleted customers found</p>
		</div>
	{:else}
		<DataTable {columns} data={data.deletedCustomers} />
	{/if}
</div>
