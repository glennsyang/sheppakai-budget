<script lang="ts">
	import type { Transaction } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import { toTransactionFormData } from '$lib/formSchemas';

	let {
		id,
		transactionData,
		actionUrl,
		deleteMessage
	}: {
		id: string;
		transactionData: Transaction;
		actionUrl: string;
		deleteMessage: string;
	} = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const categories = getCategoriesContext();
	const transactionForm = transactionFormContext.get();
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

<TransactionModal
	bind:open={openEditModal}
	initialData={toTransactionFormData(transactionData)}
	isEditing
	categories={categories()}
	{transactionForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	{actionUrl}
	title="Delete transaction"
	message={deleteMessage}
	confirmButtonText="Delete"
/>
