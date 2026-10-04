<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>API logs · Admin</title>
</svelte:head>

<SectionHeader title="API logs" description="Every write made through the external API" />

{#if data.loadError}
	<LoadErrorBanner message={data.loadError} />
{:else}
	<DataTable
		{columns}
		data={data.entries}
		defaultPageSize={20}
		defaultSorting={[{ id: 'createdAt', desc: true }]}
		searchPlaceholder="Search actions, paths or users…"
		emptyMessage="No API activity yet."
	/>
{/if}
