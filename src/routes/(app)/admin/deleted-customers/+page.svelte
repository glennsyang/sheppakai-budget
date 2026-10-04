<script lang="ts">
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { restoreCustomerFormContext } from '$lib/contexts';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	restoreCustomerFormContext.set(data.form);
</script>

<svelte:head>
	<title>Deleted customers · Admin</title>
</svelte:head>

<SectionHeader
	title="Deleted customers"
	description="Window-cleaning customers that were deleted. Restore one to recover it and its jobs."
/>

{#if data.loadError}
	<LoadErrorBanner message={data.loadError} />
{:else}
	<DataTable
		{columns}
		data={data.deletedCustomers}
		searchable={data.deletedCustomers.length > 10}
		emptyMessage="No deleted customers."
	/>
{/if}
