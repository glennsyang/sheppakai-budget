<script lang="ts">
	import type { PageProps } from './$types';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import CategoryModal from '$lib/components/CategoryModal.svelte';

	let { data }: PageProps = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Categories - Setup - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Categories</h1>
		<p class="mt-2 text-muted-foreground">Manage your categories for better budget tracking</p>
	</div>

	<div class="overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div></div>
				<div class="flex items-center gap-2">
					<Button size="sm" onclick={() => (openModal = true)}>
						<PlusIcon class="mr-2 size-4" />
						Add Category
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

<CategoryModal bind:open={openModal} bind:isLoading={loading} />
