<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Income } from '$lib';
	import IncomeModal from '$lib/components/IncomeModal.svelte';

	let { id, incomeData }: { id: string; incomeData: Income } = $props();
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
			const response = await fetch(`/api/income/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Refresh the income list after successful deletion
				console.log(`Deleted income with id: ${id}`);
				// await fetchIncome();
			} else {
				console.error('Failed to delete income:', await response.json());
			}
		} catch (error) {
			console.error('Error deleting income:', error);
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

<IncomeModal
	bind:open={showEditDialog}
	onOpenChange={(open) => (showEditDialog = open)}
	onIncomeUpdated={handleUpdated}
	initialData={{
		id,
		amount: incomeData?.amount,
		description: incomeData?.description,
		date: incomeData?.date
	}}
	isEditing={true}
/>
