<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import SavingsModal from '$lib/components/SavingsModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { savingsFormContext } from '$lib/contexts';
	import type { savingsSchema } from '$lib/formSchemas';

	import type { Savings } from '$lib';

	let { id, savingsData }: { id: string; savingsData: Savings } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const savingsForm = savingsFormContext.get() as SuperValidated<z.infer<typeof savingsSchema>>;
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
	title="Delete Savings"
	message="Are you sure you want to delete this savings entry?"
	confirmButtonText="Delete"
/>
