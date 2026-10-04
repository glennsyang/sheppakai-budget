<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { unArchiveFormContext } from '$lib/contexts';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) unArchiveFormContext.set(data.form);
</script>

<svelte:head>
	<title>Archived goals · Admin</title>
</svelte:head>

<SectionHeader
	title="Archived goals"
	description="Savings goals taken off the goals page. Restore one to bring it back."
/>

{#if data.loadError}
	<LoadErrorBanner message={data.loadError} />
{:else}
	<DataTable
		{columns}
		data={data.archivedGoals}
		searchable={data.archivedGoals.length > 10}
		emptyMessage="No archived goals."
	/>
{/if}
