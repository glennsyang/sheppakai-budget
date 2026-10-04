<script lang="ts">
	import CategoryModal from '$lib/components/CategoryModal.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { categoryFormContext } from '$lib/contexts';
	import { categoryColorMap } from '$lib/utils/categoryColors';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { createColumns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	categoryFormContext.set(data.form);

	let openModal = $state<boolean>(false);

	let columns = $derived(createColumns(categoryColorMap(data.categories)));
</script>

<svelte:head>
	<title>Categories</title>
</svelte:head>

<PageShell
	title="Categories"
	subtitle="{data.categories.length} categories group spending and set each month's budget"
>
	{#snippet actions()}
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			Add category
		</Button>
	{/snippet}

	<!-- Categories come from the (app) layout, which also renders the banner if they failed to load. -->
	{#if !data.categoriesLoadError}
		<DataTable
			{columns}
			data={data.categories}
			defaultPageSize={20}
			defaultSorting={[{ id: 'name', desc: false }]}
			searchPlaceholder="Search categories…"
			emptyMessage="No categories yet. Add groceries, gas or anything you budget for."
		/>
	{/if}
</PageShell>

<CategoryModal bind:open={openModal} categoryForm={data.form} />
