<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RecurringModal from '$lib/components/RecurringModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { recurringSchema } from '$lib/formSchemas';

	import type { Recurring } from '$lib';

	let { id, recurringData }: { id: string; recurringData: Recurring } = $props();

	const recurringForm = getContext('recurringForm') as SuperValidated<
		z.infer<typeof recurringSchema>
	>;

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
		<DropdownMenu.Item>Paid</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<RecurringModal
	bind:open={openEditModal}
	initialData={{
		id,
		merchant: recurringData?.merchant,
		description: recurringData?.description,
		cadence: recurringData?.cadence,
		amount: recurringData?.amount
	}}
	{recurringForm}
	isEditing
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/recurring/delete"
	title="Delete Recurring"
	message="Are you sure you want to delete this recurring expense?"
	confirmButtonText="Delete"
/>
