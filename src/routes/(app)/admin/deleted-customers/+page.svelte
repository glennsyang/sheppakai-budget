<script lang="ts">
	import { setContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import type { restoreCustomerSchema } from '$lib/formSchemas/windowCleaning';

	import { columns } from './columns';

	import type { WindowCleaningCustomer } from '$lib';

	type DeletedCustomer = WindowCleaningCustomer & { user: { name: string; email: string } };

	interface Props {
		data: {
			deletedCustomers: DeletedCustomer[];
			form: SuperValidated<z.infer<typeof restoreCustomerSchema>>;
		};
	}

	let { data }: Props = $props();

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

	{#if data.deletedCustomers.length === 0}
		<div class="flex h-64 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No deleted customers found</p>
		</div>
	{:else}
		<DataTable {columns} data={data.deletedCustomers} />
	{/if}
</div>
