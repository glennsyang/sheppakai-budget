<script lang="ts">
	import type { Savings } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import SavingsModal from '$lib/components/SavingsModal.svelte';
	import { savingsFormContext } from '$lib/contexts';

	let { id, savingsData }: { id: string; savingsData: Savings } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const savingsForm = savingsFormContext.get();
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

<SavingsModal
	bind:open={openEditModal}
	initialData={{
		id,
		title: savingsData?.title,
		description: savingsData?.description ?? undefined,
		amount: savingsData?.amount
	}}
	isEditing
	{savingsForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/savings?/delete"
	title="Delete savings account"
	message="Are you sure you want to delete this savings entry?"
	confirmButtonText="Delete"
/>
