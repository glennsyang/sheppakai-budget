<script lang="ts">
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	import { columns, type AdminApiLogEntry } from './columns';

	interface Props {
		data: {
			entries: AdminApiLogEntry[];
			loadError?: string;
		};
	}

	let { data }: Props = $props();
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
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm"
		>
			{data.loadError}
		</div>
	{:else if data.entries.length === 0}
		<div class="flex h-32 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No API activity yet</p>
		</div>
	{:else}
		<DataTable {columns} data={data.entries} defaultSorting={[{ id: 'createdAt', desc: true }]} />
	{/if}
</div>
