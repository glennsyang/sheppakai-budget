<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Expense } from '$lib';
	import ExpenseModal from '$lib/components/ExpenseModal.svelte';

	let { id, expenseData }: { id: string; expenseData: Expense } = $props();
	let showEditDialog = $state<boolean>(false);
	let showDeleteConfirm = $state<boolean>(false);

	async function openEditDialog() {
		showEditDialog = true;
	}

	function handleUpdated() {
		showEditDialog = false;
	}

	function showDeleteConfirmation() {
		showDeleteConfirm = true;
	}

	function onOpenChange(open: boolean) {
		showDeleteConfirm = open;
	}

	function onConfirm() {
		showDeleteConfirm = false;
		handleDelete(id);
	}

	async function handleDelete(id: string) {
		try {
			const response = await fetch(`/api/expenses/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Refresh the expense list after successful deletion
				console.log(`Deleted expense with id: ${id}`);
				// await fetchExpense();
			} else {
				console.error('Failed to delete expense:', await response.json());
			}
		} catch (error) {
			console.error('Error deleting expense:', error);
		}
	}
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
		<DropdownMenu.Item onclick={() => openEditDialog()}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => showDeleteConfirmation()}>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<ConfirmModal
	bind:open={showDeleteConfirm}
	title="Delete Entry"
	message="Are you sure you want to delete this entry?"
	{onConfirm}
	{onOpenChange}
/>

<ExpenseModal
	bind:open={showEditDialog}
	onOpenChange={(open) => (showEditDialog = open)}
	onExpenseUpdated={handleUpdated}
	initialData={{
		id,
		amount: expenseData?.amount,
		categoryId: expenseData?.category?.id || '',
		description: expenseData?.description,
		date: expenseData?.date
	}}
	isEditing={true}
/>
