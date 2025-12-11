<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import type { Category } from '$lib';
	import CategoryModal from '$lib/components/CategoryModal.svelte';

	let { id, categoryData }: { id: string; categoryData: Category } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
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

<CategoryModal
	bind:open={openEditModal}
	initialData={{
		id,
		name: categoryData?.name,
		description: categoryData?.description
	}}
	isEditing
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/categories?/delete"
	title="Delete Category"
	message="Are you sure you want to delete this category?"
	confirmButtonText="Delete"
/>
