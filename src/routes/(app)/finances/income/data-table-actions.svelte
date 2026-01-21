<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import IncomeModal from '$lib/components/IncomeModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { incomeFormContext } from '$lib/contexts';
	import type { incomeSchema } from '$lib/formSchemas';

	import type { Income } from '$lib';

	let { id, incomeData }: { id: string; incomeData: Income } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const incomeForm = incomeFormContext.get() as SuperValidated<z.infer<typeof incomeSchema>>;
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
	actionUrl="/finances/income?/delete"
	title="Delete Income"
	message="Are you sure you want to delete this income source?"
	confirmButtonText="Delete"
/>
