<script lang="ts">
	import type { Income } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import { incomeFormContext } from '$lib/contexts';
	import type { incomeSchema } from '$lib/formSchemas';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	let { id, incomeData }: { id: string; incomeData: Income } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const incomeForm = incomeFormContext.get() as SuperValidated<z.infer<typeof incomeSchema>>;
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

<IncomeModal
	bind:open={openEditModal}
	initialData={{
		id,
		name: incomeData?.name,
		description: incomeData?.description,
		date: incomeData?.date,
		amount: incomeData?.amount
	}}
	isEditing
	{incomeForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/income?/delete"
	title="Delete Income"
	message="Are you sure you want to delete this income source?"
	confirmButtonText="Delete"
/>
