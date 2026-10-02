<script lang="ts">
	import type { Category } from '$lib';
	import CategoryModal from '$lib/components/CategoryModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import { categoryFormContext } from '$lib/contexts';

	let { id, categoryData }: { id: string; categoryData: Category } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const categoryForm = categoryFormContext.get();
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

<CategoryModal
	bind:open={openEditModal}
	initialData={{
		id,
		name: categoryData?.name,
		description: categoryData?.description
	}}
	isEditing
	{categoryForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/categories?/delete"
	title="Delete Category"
	message="Are you sure you want to delete this category?"
	confirmButtonText="Delete"
/>
