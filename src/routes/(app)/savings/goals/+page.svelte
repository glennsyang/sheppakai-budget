<script lang="ts">
	import { PlusIcon } from '@lucide/svelte/icons';
	import { setContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import SavingsGoalCard from '$lib/components/SavingsGoalCard.svelte';
	import SavingsGoalModal from '$lib/components/SavingsGoalModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import type { contributionSchema, savingsGoalSchema } from '$lib/formSchemas/savings';
	import { formatLocalTimestamp } from '$lib/utils/dates';

	import DataTableActions from './data-table-actions.svelte';

	import type { Contribution, SavingsGoalWithProgress } from '$lib';

	interface Props {
		data: {
			goals: Array<SavingsGoalWithProgress>;
			contributions: Contribution[];
			savingsGoalForm: SuperValidated<z.infer<typeof savingsGoalSchema>>;
			contributionForm: SuperValidated<z.infer<typeof contributionSchema>>;
		};
	}

	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	setContext('savingsGoalForm', data.savingsGoalForm);
	// svelte-ignore state_referenced_locally
	setContext('contributionForm', data.contributionForm);

	// Make goals available to child components via context
	setContext('savingsGoals', () => data.goals);

	let openGoalModal = $state<boolean>(false);
	let openContributionModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
	let openContributionsSheet = $state<boolean>(false);
	let loading = $state(false);

	let editingGoal = $state<SavingsGoalWithProgress | null>(null);
	let selectedGoalForSheet = $state<SavingsGoalWithProgress | null>(null);
	let selectedGoalId = $state<string>('');
	let deletingGoalId = $state<string>('');

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
</script>

<svelte:head>
	<title>Savings Goals</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Savings Goals</h1>
			<p class="mt-2 text-muted-foreground">Track your savings goals and contributions</p>
		</div>
		<div class="flex items-center gap-2">
			<Button size="sm" onclick={handleCreateGoal}>
				<PlusIcon class="mr-2 h-4 w-4" />
				Create New Goal
			</Button>
		</div>
	</div>

	<!-- Summary Card -->
	<Card class="mb-6">
		<CardHeader>
			<CardTitle class="text-xl">Overall Progress</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="text-center">
					<p class="text-sm text-muted-foreground">Total Target</p>
					<p class="text-2xl font-bold">
						${totalTargetAmount.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</p>
				</div>
				<div class="text-center">
					<p class="text-sm text-muted-foreground">Total Saved</p>
					<p class="text-2xl font-bold text-green-600 dark:text-green-400">
						${totalCurrentAmount.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</p>
				</div>
				<div class="text-center">
					<p class="text-sm text-muted-foreground">Overall Progress</p>
					<p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
						{Math.round(overallProgress)}%
					</p>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Goals Grid -->
	{#if data.goals.length > 0}
		<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.goals as goal (goal.id)}
				<SavingsGoalCard
					{goal}
					onViewContributions={handleOpenGoalContributions}
					onAddContribution={handleAddContribution}
					onEditGoal={handleEditGoal}
					onDeleteGoal={handleDeleteGoal}
				/>
			{/each}
		</div>
	{:else}
		<Card class="mb-8">
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">
					No savings goals yet. Create your first goal to get started!
				</p>
				<Button class="mt-4" onclick={handleCreateGoal}>
					<PlusIcon class="mr-2 h-4 w-4" />
					Create Your First Goal
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>

<Sheet.Root bind:open={openContributionsSheet}>
	<Sheet.Content side="right" class="flex w-full flex-col sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>
				{selectedGoalForSheet?.name || 'Savings Goal'} Contributions
			</Sheet.Title>
			<Sheet.Description>View all contributions for this savings goal.</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 overflow-y-auto px-4 py-3 sm:py-4">
			{#if selectedGoalContributions.length === 0}
				<div class="flex h-32 items-center justify-center text-muted-foreground">
					No contributions for this goal yet.
				</div>
			{:else}
				<div class="space-y-2 sm:hidden">
					{#each selectedGoalContributions as contribution (contribution.id)}
						<div class="rounded-md border p-3">
							<div class="mb-2 flex items-start justify-between gap-2">
								<p class="text-sm text-muted-foreground">
									{formatLocalTimestamp(contribution.date)}
								</p>
								{#if !isSelectedGoalArchived}
									<DataTableActions id={contribution.id} contributionData={contribution} />
								{/if}
							</div>
							<p class="text-sm text-foreground">
								{contribution.description || '—'}
							</p>
							<p class="mt-2 text-right font-medium">
								${contribution.amount.toLocaleString('en-US', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
							</p>
						</div>
					{/each}
				</div>

				<div class="hidden sm:block">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date</Table.Head>
								<Table.Head>Description</Table.Head>
								<Table.Head class="text-right">Amount</Table.Head>
								<Table.Head class="w-12" />
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each selectedGoalContributions as contribution (contribution.id)}
								<Table.Row>
									<Table.Cell class="whitespace-nowrap">
										{formatLocalTimestamp(contribution.date)}
									</Table.Cell>
									<Table.Cell class="max-w-[240px] truncate">
										{contribution.description || '—'}
									</Table.Cell>
									<Table.Cell class="text-right font-medium whitespace-nowrap">
										${contribution.amount.toLocaleString('en-US', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										})}
									</Table.Cell>
									<Table.Cell>
										{#if !isSelectedGoalArchived}
											<DataTableActions id={contribution.id} contributionData={contribution} />
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</div>

		<Sheet.Footer class="border-t pt-4">
			<div class="flex w-full justify-between font-semibold">
				<span>
					{selectedGoalContributions.length}
					{selectedGoalContributions.length === 1 ? 'contribution' : 'contributions'}
				</span>
				<span>
					${selectedGoalContributions
						.reduce((sum, contribution) => sum + contribution.amount, 0)
						.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
				</span>
			</div>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>

<!-- Modals -->
<SavingsGoalModal
	bind:open={openGoalModal}
	bind:isLoading={loading}
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
	bind:isLoading={loading}
	goals={data.goals}
	preselectedGoalId={selectedGoalId}
	contributionForm={data.contributionForm}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	id={deletingGoalId}
	actionUrl="/savings/goals?/deleteGoal"
	title="Delete Savings Goal"
	message="Are you sure you want to delete this goal? You can only delete goals with no contributions."
	confirmButtonText="Delete Goal"
/>
