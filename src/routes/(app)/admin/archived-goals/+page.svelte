<script lang="ts">
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { unArchiveFormContext } from '$lib/contexts';
	import type { unArchiveSchema } from '$lib/formSchemas';

	import { columns } from './columns';

	import type { SavingsGoal } from '$lib';

	interface Props {
		data: {
			archivedGoals: SavingsGoal[];
			form: SuperValidated<z.infer<typeof unArchiveSchema>>;
		};
	}

	let { data }: Props = $props();

	let loading = $state<boolean>(false);
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

	{#if loading}
		<TableSkeleton rows={5} columns={6} />
	{:else if data.archivedGoals.length === 0}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No archived goals found</p>
		</div>
	{:else}
		<DataTable {columns} data={data.archivedGoals} />
	{/if}
</div>
