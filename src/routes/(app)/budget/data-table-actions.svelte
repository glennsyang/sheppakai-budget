<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Budget, Category } from '$lib';
	import BudgetModal from '$lib/components/BudgetModal.svelte';
	import { getContext } from 'svelte';

	let { id, budgetData }: { id: string; budgetData: Budget } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const categories = getContext('categories') as () => Category[];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => (openEditModal = true)}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (openDeleteModal = true)}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<BudgetModal
	bind:open={openEditModal}
	initialData={{
		id,
		amount: budgetData?.amount,
		year: budgetData?.year,
		month: budgetData?.month,
		categoryId: budgetData?.category?.id
	}}
	isEditing
	categories={categories()}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/budget?/delete"
	title="Delete Entry"
	message="Are you sure you want to delete this entry?"
	confirmButtonText="Delete"
/>
