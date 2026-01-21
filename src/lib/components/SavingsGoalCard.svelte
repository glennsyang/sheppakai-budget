<script lang="ts">
	import { ArchiveIcon, PenIcon, PlusIcon, Trash2Icon } from '@lucide/svelte/icons';

	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Progress } from '$lib/components/ui/progress';
	import { formatLocalTimestamp } from '$lib/utils/dates';

	import type { SavingsGoalWithProgress } from '$lib';

	interface Props {
		goal: SavingsGoalWithProgress;
		onAddContribution: (goalId: string) => void;
		onEditGoal: (goal: SavingsGoalWithProgress) => void;
		onDeleteGoal: (goalId: string) => void;
		onArchiveGoal: (goalId: string) => void;
	}

	let { goal, onAddContribution, onEditGoal, onDeleteGoal, onArchiveGoal }: Props = $props();
	let showArchiveDialog = $state(false);

	// Determine card color based on status
	let statusColor = $derived(
		goal.status === 'completed'
			? 'border-green-500'
			: goal.status === 'paused'
				? 'border-gray-400'
				: goal.status === 'archived'
					? 'border-gray-300 dark:border-gray-600'
					: 'border-blue-500'
	);

	// Determine progress color based on percentage
	let progressColor = $derived(
		goal.percentage >= 100
			? 'text-green-600 dark:text-green-400'
			: goal.percentage >= 50
				? 'text-blue-600 dark:text-blue-400'
				: 'text-orange-600 dark:text-orange-400'
	);
</script>

<Card class="border-2 {statusColor}">
	<CardHeader class="pb-3">
		<div class="flex items-start justify-between">
			<div class="flex-1">
				<CardTitle class="text-lg">{goal.name}</CardTitle>
				{#if goal.description}
					<p class="mt-1 text-sm text-muted-foreground">{goal.description}</p>
				{/if}
			</div>
			<div class="flex gap-1">
				<Tooltip.Root>
					<Tooltip.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'h-8 w-8' })}
						onclick={() => onEditGoal(goal)}
					>
						<PenIcon class="h-4 w-4" />
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Edit</p>
					</Tooltip.Content>
				</Tooltip.Root>
				{#if goal.status === 'completed'}
					<Tooltip.Root>
						<Tooltip.Trigger
							class={buttonVariants({
								variant: 'ghost',
								size: 'icon',
								class: 'h-8 w-8 text-muted-foreground hover:text-muted-foreground'
							})}
							onclick={() => (showArchiveDialog = true)}
						>
							<ArchiveIcon class="h-4 w-4" />
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Archive</p>
						</Tooltip.Content>
					</Tooltip.Root>
				{/if}
				<Tooltip.Root>
					<Tooltip.Trigger
						class={buttonVariants({
							variant: 'ghost',
							size: 'icon',
							class: 'h-8 w-8 text-destructive hover:text-destructive'
						})}
						onclick={() => onDeleteGoal(goal.id)}
					>
						<Trash2Icon class="h-4 w-4" />
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Delete</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>
	</CardHeader>
	<CardContent class="space-y-4">
		<!-- Circular Progress Indicator -->
		<div class="flex items-center justify-center">
			<div class="relative flex h-32 w-32 items-center justify-center">
				<svg class="h-full w-full -rotate-90 transform">
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="currentColor"
						stroke-width="8"
						fill="transparent"
						class="text-gray-200 dark:text-gray-700"
					/>
					<circle
						cx="64"
						cy="64"
						r="56"
						stroke="currentColor"
						stroke-width="8"
						fill="transparent"
						stroke-dasharray={2 * Math.PI * 56}
						stroke-dashoffset={2 * Math.PI * 56 * (1 - goal.percentage / 100)}
						class={progressColor}
						stroke-linecap="round"
					/>
				</svg>
				<div class="absolute flex flex-col items-center justify-center">
					<span class="text-2xl font-bold {progressColor}">{Math.round(goal.percentage)}%</span>
				</div>
			</div>
		</div>

		<!-- Amount Details -->
		<div class="space-y-2">
			<div class="flex justify-between text-sm">
				<span class="text-muted-foreground">Goal:</span>
				<span class="font-semibold"
					>${goal.targetAmount.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					})}</span
				>
			</div>
			<div class="flex justify-between text-sm">
				<span class="text-muted-foreground">Current:</span>
				<span class="font-semibold"
					>${goal.currentAmount.toLocaleString('en-US', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					})}</span
				>
			</div>
			<Progress value={goal.percentage} max={100} class="h-2" />
		</div>

		<!-- Target Date -->
		{#if goal.targetDate}
			<div class="text-center text-sm text-muted-foreground">
				Target: {formatLocalTimestamp(goal.targetDate)}
			</div>
		{/if}

		<!-- Status Badge -->
		<div class="flex items-center justify-between">
			<span
				class="rounded-full px-3 py-1 text-xs font-medium {goal.status === 'completed'
					? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
					: goal.status === 'paused'
						? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
						: goal.status === 'archived'
							? 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
							: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}"
			>
				{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
			</span>
		</div>

		<!-- Action Button -->
		<Button
			class="w-full"
			variant={goal.status === 'completed' ? 'outline' : 'default'}
			onclick={() => onAddContribution(goal.id)}
			disabled={goal.status === 'completed'}
		>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add Contribution
		</Button>
	</CardContent>
</Card>

<!-- Archive Confirmation Dialog -->
<Dialog.Root bind:open={showArchiveDialog}>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>Archive Goal</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to archive this goal? Archived goals will be hidden from the main
				view.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close><Button variant="outline">Cancel</Button></Dialog.Close>
			<Button
				onclick={() => {
					showArchiveDialog = false;
					onArchiveGoal(goal.id);
				}}>Archive</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
