<script lang="ts">
	import { PlusIcon } from '@lucide/svelte/icons';
	import { setContext } from 'svelte';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import ContributionModal from '$lib/components/ContributionModal.svelte';
	import SavingsGoalCard from '$lib/components/SavingsGoalCard.svelte';
	import SavingsGoalModal from '$lib/components/SavingsGoalModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { DataTable } from '$lib/components/ui/data-table';

	import { columns } from './columns';

	import type { Contribution, SavingsGoal } from '$lib';

	interface Props {
		data: {
			goals: Array<
				SavingsGoal & {
					currentAmount: number;
					percentage: number;
				}
			>;
			contributions: Contribution[];
		};
	}

	let { data }: Props = $props();

	// Make goals available to child components via context
	setContext('savingsGoals', () => data.goals);

	let openGoalModal = $state<boolean>(false);
	let openContributionModal = $state<boolean>(false);
	let openDeleteModal = $state<boolean>(false);
	let loading = $state(false);

	let editingGoal = $state<
		| (SavingsGoal & {
				currentAmount: number;
				percentage: number;
		  })
		| null
	>(null);
	let selectedGoalId = $state<string>('');
	let deletingGoalId = $state<string>('');

	function handleCreateGoal() {
		editingGoal = null;
		openGoalModal = true;
	}

	function handleEditGoal(goal: any) {
		editingGoal = goal;
		openGoalModal = true;
	}

	function handleAddContribution(goalId: string) {
		selectedGoalId = goalId;
		openContributionModal = true;
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

	<!-- Recent Contributions Table -->
	<div class="overflow-hidden rounded-lg border shadow">
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between">
				<div>
					<h2 class="text-2xl font-bold tracking-tight">Recent Contributions</h2>
					<p class="mt-1 text-sm text-muted-foreground">
						History of all contributions to your savings goals
					</p>
				</div>
				<Button
					size="sm"
					variant="outline"
					onclick={() => (openContributionModal = true)}
					disabled={data.goals.filter((g) => g.status === 'active').length === 0}
				>
					<PlusIcon class="mr-2 h-4 w-4" />
					Add Contribution
				</Button>
			</div>
			{#if data.contributions.length > 0}
				<DataTable {columns} data={data.contributions} />
			{:else}
				<div class="py-8 text-center text-muted-foreground">
					No contributions yet. Start adding contributions to track your progress!
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Modals -->
<SavingsGoalModal
	bind:open={openGoalModal}
	bind:isLoading={loading}
	initialData={editingGoal
		? {
				id: editingGoal.id,
				name: editingGoal.name,
				description: editingGoal.description,
				targetAmount: editingGoal.targetAmount,
				targetDate: editingGoal.targetDate,
				status: editingGoal.status
			}
		: undefined}
	isEditing={editingGoal !== null}
/>

<ContributionModal
	bind:open={openContributionModal}
	bind:isLoading={loading}
	goals={data.goals}
	preselectedGoalId={selectedGoalId}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	id={deletingGoalId}
	actionUrl="/savings/goals?/deleteGoal"
	title="Delete Savings Goal"
	message="Are you sure you want to delete this goal? You can only delete goals with no contributions."
	confirmButtonText="Delete Goal"
/>
