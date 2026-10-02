<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { unArchiveFormContext } from '$lib/contexts';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) unArchiveFormContext.set(data.form);
</script>

<svelte:head>
	<title>Archived Savings Goals</title>
</svelte:head>

<div class="space-y-4">
	<div>
		<h2 class="text-2xl font-bold">Archived Savings Goals</h2>
		<p class="text-muted-foreground">View and restore archived savings goals</p>
	</div>

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else if data.archivedGoals.length === 0}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No archived goals found</p>
		</div>
	{:else}
		<DataTable {columns} data={data.archivedGoals} />
	{/if}
</div>
