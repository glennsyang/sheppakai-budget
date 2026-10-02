<script lang="ts">
	import type { Contribution, SavingsGoal } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import {
		contributionFormContext,
		contributionSuccessContext,
		savingsGoalsContext
	} from '$lib/contexts';

	let { id, contributionData }: { id: string; contributionData: Contribution } = $props();

	let openEditModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);

	const goals = savingsGoalsContext.get();
	const contributionForm = contributionFormContext.get();
	const onContributionSuccess = contributionSuccessContext.get();
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
