<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Category, Expense } from '$lib';
	import ExpenseModal from '$lib/components/ExpenseModal.svelte';
	import { getContext } from 'svelte';

	let { id, expenseData }: { id: string; expenseData: Expense } = $props();

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

<ExpenseModal
	bind:open={openEditModal}
	initialData={{
		id,
		amount: expenseData?.amount,
		categoryId: expenseData?.category?.id,
		description: expenseData?.description,
		date: expenseData?.date
	}}
	isEditing
	categories={categories()}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/expense?/delete"
	title="Delete Entry"
	message="Are you sure you want to delete this entry?"
	confirmButtonText="Delete"
/>
