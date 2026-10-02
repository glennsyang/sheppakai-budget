<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>API Logs</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold">API Logs</h2>
		<p class="text-muted-foreground">Audit trail of write actions taken via the external API</p>
	</div>

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else if data.entries.length === 0}
		<div class="flex h-32 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No API activity yet</p>
		</div>
	{:else}
		<DataTable {columns} data={data.entries} defaultSorting={[{ id: 'createdAt', desc: true }]} />
	{/if}
</div>
