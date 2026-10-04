<script lang="ts">
	import type { SavingsGoalWithProgress } from '$lib';
	import Confetti from '$lib/components/Confetti.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import SavingsGoalModal from '$lib/components/SavingsGoalModal.svelte';
	import SavingsGoalRow from '$lib/components/SavingsGoalRow.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import {
		contributionFormContext,
		contributionSuccessContext,
		savingsGoalsContext,
		type ContributionSuccessPayload
	} from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import { formatLocalTimestamp } from '$lib/utils/dates';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import DataTableActions from './data-table-actions.svelte';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	contributionFormContext.set(data.contributionForm);

	// Make goals available to child components via context
	savingsGoalsContext.set(() => data.goals);
	contributionSuccessContext.set(handleContributionSuccess);

	let openGoalModal = $state<boolean>(false);
	let openContributionModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
	let openContributionsSheet = $state<boolean>(false);

	let editingGoal = $state<SavingsGoalWithProgress | null>(null);
	let selectedGoalForSheet = $state<SavingsGoalWithProgress | null>(null);
	let selectedGoalId = $state<string>('');
	let deletingGoalId = $state<string>('');
	let celebrationBurstId = $state(0);

	function handleCreateGoal() {
		editingGoal = null;
		openGoalModal = true;
	}

	function handleEditGoal(goal: SavingsGoalWithProgress) {
		editingGoal = goal;
		openGoalModal = true;
	}

	function handleAddContribution(goalId: string) {
		selectedGoalId = goalId;
		openContributionModal = true;
	}

	function handleOpenGoalContributions(goal: SavingsGoalWithProgress) {
		selectedGoalForSheet = goal;
		openContributionsSheet = true;
	}

	function handleDeleteGoal(goalId: string) {
		deletingGoalId = goalId;
		openDeleteModal = true;
	}

	function makeConfettiBurst() {
		celebrationBurstId += 1;
	}

	function handleContributionSuccess(payload: ContributionSuccessPayload) {
		const goal = data.goals.find((entry) => entry.id === payload.goalId);
		if (!goal || goal.targetAmount <= 0) {
			return;
		}

		let projectedAmount = goal.currentAmount + payload.amount;

		if (payload.previousGoalId === payload.goalId && typeof payload.previousAmount === 'number') {
			projectedAmount = goal.currentAmount - payload.previousAmount + payload.amount;
		}

		const didCrossTarget =
			goal.currentAmount < goal.targetAmount && projectedAmount >= goal.targetAmount;

		if (didCrossTarget) {
			makeConfettiBurst();
		}
	}

	// Calculate totals
	let totalTargetAmount = $derived(data.goals.reduce((sum, goal) => sum + goal.targetAmount, 0));
	let totalCurrentAmount = $derived(data.goals.reduce((sum, goal) => sum + goal.currentAmount, 0));
	let overallProgress = $derived(
		totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
	);

	let selectedGoalContributions = $derived.by(() => {
		if (!selectedGoalForSheet) {
			return [];
		}

		const goalId = selectedGoalForSheet.id;

		return data.contributions
			.filter((contribution) => contribution.goalId === goalId)
			.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	});

	let isSelectedGoalArchived = $derived(selectedGoalForSheet?.status === 'archived');

	let reachedCount = $derived(
		data.goals.filter((g) => g.status === 'completed' || g.percentage >= 100).length
	);

	let stats = $derived<Stat[]>([
		{ label: 'Saved toward goals', value: formatCurrency(totalCurrentAmount) },
		{ label: 'Total of all targets', value: formatCurrency(totalTargetAmount) },
		{
			label: 'Overall progress',
			value: `${Math.round(overallProgress)}%`,
			meter: overallProgress,
			tone: overallProgress >= 100 ? 'positive' : 'neutral',
			subtext: `${reachedCount} of ${data.goals.length} goals reached`
		}
	]);

	let selectedContributionsTotal = $derived(
		selectedGoalContributions.reduce((sum, contribution) => sum + contribution.amount, 0)
	);
</script>

<svelte:head>
	<title>Savings goals</title>
</svelte:head>

<Confetti burstId={celebrationBurstId} />

<PageShell title="Savings goals" subtitle="What you are saving toward, and how close each one is">
	{#snippet actions()}
		<Button onclick={handleCreateGoal}>
			<PlusIcon />
			New goal
		</Button>
	{/snippet}

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else if data.goals.length > 0}
		<DashboardStatStrip {stats} />
		<section class="bg-card overflow-hidden rounded-xl border shadow-sm">
			<ul class="divide-y">
				{#each data.goals as goal (goal.id)}
					<SavingsGoalRow
						{goal}
						onViewContributions={handleOpenGoalContributions}
						onAddContribution={handleAddContribution}
						onEditGoal={handleEditGoal}
						onDeleteGoal={handleDeleteGoal}
					/>
				{/each}
			</ul>
		</section>
	{:else}
		<section class="bg-card rounded-xl border px-6 py-12 text-center shadow-sm">
			<h2 class="text-base font-semibold tracking-tight">No goals yet</h2>
			<p class="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
				Name something you are saving for, set a target, and log contributions as you put money
				aside.
			</p>
			<Button class="mt-5" onclick={handleCreateGoal}>
				<PlusIcon />
				Create your first goal
			</Button>
		</section>
	{/if}
</PageShell>

<Sheet.Root bind:open={openContributionsSheet}>
	<Sheet.Content side="right" class="flex w-full flex-col gap-0 sm:max-w-lg">
		<Sheet.Header class="border-b">
			<Sheet.Title>{selectedGoalForSheet?.name || 'Savings goal'}</Sheet.Title>
			<Sheet.Description>Every contribution to this goal, newest first.</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 overflow-y-auto">
			{#if selectedGoalContributions.length === 0}
				<p class="text-muted-foreground px-4 py-12 text-center text-sm">
					No contributions to this goal yet.
				</p>
			{:else}
				<ul class="divide-y">
					{#each selectedGoalContributions as contribution (contribution.id)}
						<li class="flex min-h-14 items-center gap-3 py-2.5 ps-4 pe-2">
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">
									{contribution.description || 'Contribution'}
								</p>
								<p class="text-muted-foreground text-xs">
									{formatLocalTimestamp(contribution.date)}
								</p>
							</div>
							<span class="text-sm font-medium tabular-nums">
								{formatCurrency(contribution.amount)}
							</span>
							{#if !isSelectedGoalArchived}
								<DataTableActions id={contribution.id} contributionData={contribution} />
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<Sheet.Footer class="border-t">
			<div class="flex w-full items-baseline justify-between text-sm">
				<span class="text-muted-foreground">
					{selectedGoalContributions.length}
					{selectedGoalContributions.length === 1 ? 'contribution' : 'contributions'}
				</span>
				<span class="font-semibold tabular-nums">{formatCurrency(selectedContributionsTotal)}</span>
			</div>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<!-- Modals -->
<SavingsGoalModal
	bind:open={openGoalModal}
	initialData={editingGoal
		? {
				id: editingGoal.id,
				name: editingGoal.name,
				description: editingGoal.description ?? undefined,
				targetAmount: editingGoal.targetAmount,
				targetDate: editingGoal.targetDate ?? undefined,
				status: editingGoal.status
			}
		: undefined}
	isEditing={editingGoal !== null}
	savingsGoalForm={data.savingsGoalForm}
/>

<ContributionModal
	bind:open={openContributionModal}
	goals={data.goals}
	preselectedGoalId={selectedGoalId}
	contributionForm={data.contributionForm}
	onSuccess={handleContributionSuccess}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	id={deletingGoalId}
	actionUrl="/savings/goals?/deleteGoal"
	title="Delete savings goal"
	message="Are you sure you want to delete this goal? You can only delete goals with no contributions."
	confirmButtonText="Delete goal"
/>
