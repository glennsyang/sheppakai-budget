<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Recurring } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RecurringModal from '$lib/components/RecurringModal.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { recurringSchema } from '$lib/formSchemas';
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	let { id, recurringData }: { id: string; recurringData: Recurring } = $props();

	const recurringForm = getContext('recurringForm') as SuperValidated<
		z.infer<typeof recurringSchema>
	>;

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
	let togglingPaid = $state<boolean>(false);
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
		<DropdownMenu.Item>
			<form
				class="toggle-paid-form"
				method="POST"
				action="?/togglePaid"
				use:enhance={() => {
					togglingPaid = true;
					return async ({ result, update }) => {
						if (result.type === 'success') {
							await invalidateAll();
						} else if (result.type === 'failure' && result.data?.error) {
							toast.error((result.data.error as string) || 'Failed to toggle paid status');
						} else {
							toast.error('Failed to toggle paid status');
						}

						await update();
						togglingPaid = false;
					};
				}}
			>
				<input type="hidden" name="id" value={id} />
				<input type="hidden" name="paid" value={recurringData?.paid ? 'false' : 'true'} />
				<Button type="submit" size="sm" variant="ghost" disabled={togglingPaid}
					>{recurringData?.paid ? 'Mark Unpaid' : 'Mark Paid'}</Button
				>
			</form>
		</DropdownMenu.Item>
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
	actionUrl="?/delete"
	title="Delete Recurring"
	message="Are you sure you want to delete this recurring expense?"
	confirmButtonText="Delete"
/>

<style>
	:global(.toggle-paid-form button) {
		padding: 0;
		height: 8px;
	}
</style>
