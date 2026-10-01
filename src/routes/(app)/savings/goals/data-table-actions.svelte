<script lang="ts">
	import type { Contribution, SavingsGoal } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import type { contributionSchema } from '$lib/formSchemas/savings';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	interface ContributionSuccessPayload {
		goalId: string;
		amount: number;
		previousGoalId?: string;
		previousAmount?: number;
	}

	let { id, contributionData }: { id: string; contributionData: Contribution } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const goals = getContext('savingsGoals') as () => SavingsGoal[];
	const contributionForm = getContext('contributionForm') as SuperValidated<
		z.infer<typeof contributionSchema>
	>;
	const onContributionSuccess = getContext('onContributionSuccess') as (
		payload: ContributionSuccessPayload
	) => void;
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

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
	onSuccess={onContributionSuccess}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	{id}
	actionUrl="/savings/goals?/deleteContribution"
	title="Delete Contribution"
	message="Are you sure you want to delete this contribution?"
	confirmButtonText="Delete"
/>
