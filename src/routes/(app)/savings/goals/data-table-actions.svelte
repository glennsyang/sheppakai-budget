<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { contributionSchema } from '$lib/formSchemas/savings';

	import type { Contribution, SavingsGoal } from '$lib';

	let { id, contributionData }: { id: string; contributionData: Contribution } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const goals = getContext('savingsGoals') as () => SavingsGoal[];
	const contributionForm = getContext('contributionForm') as SuperValidated<
		z.infer<typeof contributionSchema>
	>;
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

<ContributionModal
	bind:open={openEditModal}
	initialData={{
		id,
		goalId: contributionData?.goalId,
		amount: contributionData?.amount,
		date: contributionData?.date,
		description: contributionData?.description ?? undefined
	}}
	isEditing
	goals={goals()}
	{contributionForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/savings/goals?/deleteContribution"
	title="Delete Contribution"
	message="Are you sure you want to delete this contribution?"
	confirmButtonText="Delete"
/>
