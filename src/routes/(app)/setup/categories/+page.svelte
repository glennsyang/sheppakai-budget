<script lang="ts">
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { setContext } from 'svelte';

	import CategoryModal from '$lib/components/CategoryModal.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	setContext('categoryForm', data.form);

	let openModal = $state<boolean>(false);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Categories</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold tracking-tight">Categories</h1>
					<p class="mt-2 text-muted-foreground">
						Manage your categories for better budget tracking
					</p>
				</div>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openModal = true)}>
						<PlusIcon />
						Add
					</Button>
				</div>
			</div>
			{#if loading}
				<TableSkeleton rows={5} columns={3} />
			{:else}
				<DataTable {columns} data={data.categories} />
			{/if}
		</div>
	</div>
</div>

<CategoryModal bind:open={openModal} bind:isLoading={loading} categoryForm={data.form!} />
