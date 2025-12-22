<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	import type { Category, Transaction } from '$lib';

	let { id, transactionData }: { id: string; transactionData: Transaction } = $props();

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

<TransactionModal
	bind:open={openEditModal}
	initialData={{
		id,
		amount: transactionData?.amount,
		categoryId: transactionData?.category?.id,
		payee: transactionData?.payee,
		notes: transactionData?.notes,
		date: transactionData?.date
	}}
	isEditing
	categories={categories()}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/finances/transactions?/delete"
	title="Delete Transaction"
	message="Are you sure you want to delete this transaction?"
	confirmButtonText="Delete"
/>
