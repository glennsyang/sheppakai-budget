<script lang="ts">
	import type { SavingsGoalWithProgress } from '$lib';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import StatusBadge from '$lib/components/table/StatusBadge.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { formatCurrency } from '$lib/utils';
	import { formatLocalTimestamp } from '$lib/utils/dates';
	import PlusIcon from '@lucide/svelte/icons/plus';

	interface Props {
		goal: SavingsGoalWithProgress;
		onViewContributions: (goal: SavingsGoalWithProgress) => void;
		onAddContribution: (goalId: string) => void;
		onEditGoal: (goal: SavingsGoalWithProgress) => void;
		onDeleteGoal: (goalId: string) => void;
	}

	let { goal, onViewContributions, onAddContribution, onEditGoal, onDeleteGoal }: Props = $props();

	let reached = $derived(goal.status === 'completed' || goal.percentage >= 100);
	let remaining = $derived(Math.max(goal.targetAmount - goal.currentAmount, 0));
	let subline = $derived(
		[goal.targetDate && `By ${formatLocalTimestamp(goal.targetDate)}`, goal.description]
			.filter(Boolean)
			.join(' · ')
	);
	let canContribute = $derived(goal.status !== 'completed' && goal.status !== 'archived');
</script>

<li
	class="group hover:bg-muted/60 relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 px-4 py-4 transition-colors sm:px-5 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_auto]"
>
	<div class="min-w-0">
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="focus-visible:after:ring-ring/50 truncate text-left text-sm font-medium outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-inset"
				onclick={() => onViewContributions(goal)}
				aria-label="View contributions to {goal.name}"
			>
				{goal.name}
			</button>
			{#if reached}
				<StatusBadge label="Reached" tone="positive" />
			{:else if goal.status === 'paused'}
				<StatusBadge label="Paused" tone="muted" />
			{:else if goal.status === 'archived'}
				<StatusBadge label="Archived" tone="muted" />
			{/if}
		</div>
		{#if subline}
			<p class="text-muted-foreground mt-0.5 truncate text-xs">{subline}</p>
		{/if}
	</div>

	<div class="relative z-10 flex items-center gap-1 lg:order-3">
		{#if canContribute}
			<Button
				size="sm"
				variant="outline"
				class="h-11 md:h-8"
				onclick={() => onAddContribution(goal.id)}
			>
				<PlusIcon />
				<span class="hidden sm:inline">Contribute</span>
				<span class="sr-only sm:hidden">Add contribution to {goal.name}</span>
			</Button>
		{/if}
		<RowActionsMenu onEdit={() => onEditGoal(goal)} onDelete={() => onDeleteGoal(goal.id)}>
			<DropdownMenu.Item onclick={() => onViewContributions(goal)}>
				View contributions
			</DropdownMenu.Item>
		</RowActionsMenu>
	</div>

	<div class="col-span-2 flex flex-col gap-1.5 lg:order-2 lg:col-span-1">
		<div class="flex items-baseline justify-between gap-3 text-xs tabular-nums">
			<span>
				<span class="text-foreground text-sm font-medium">{formatCurrency(goal.currentAmount)}</span
				>
				<span class="text-muted-foreground"> of {formatCurrency(goal.targetAmount)}</span>
			</span>
			<span class="text-muted-foreground">
				{#if reached}
					{Math.round(goal.percentage)}%
				{:else}
					{formatCurrency(remaining)} to go · {Math.round(goal.percentage)}%
				{/if}
			</span>
		</div>
		<div
			class="bg-track h-1.5 overflow-hidden rounded-full"
			role="meter"
			aria-label="{goal.name} progress"
			aria-valuemin={0}
			aria-valuemax={goal.targetAmount}
			aria-valuenow={goal.currentAmount}
		>
			<div
				class={[
					'h-full rounded-full transition-[width] duration-500 ease-out',
					goal.status === 'paused' || goal.status === 'archived'
						? 'bg-muted-foreground/50'
						: 'bg-positive'
				]}
				style:width="{Math.min(goal.percentage, 100)}%"
			></div>
		</div>
	</div>
</li>
