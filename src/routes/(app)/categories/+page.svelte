<script lang="ts">
	import CategoryModal from '$lib/components/CategoryModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { setContext } from 'svelte';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	setContext('categoryForm', data.form);

	let openModal = $state<boolean>(false);
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
					<p class="text-muted-foreground mt-2">
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
			<DataTable {columns} data={data.categories} />
		</div>
	</div>
</div>

<CategoryModal bind:open={openModal} categoryForm={data.form!} />
