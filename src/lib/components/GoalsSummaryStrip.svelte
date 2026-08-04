<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import type { SavingsGoalWithProgress } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { formatLocalTimestamp } from '$lib/utils/dates';
	import { CheckIcon, ExternalLinkIcon, PauseIcon, TargetIcon } from '@lucide/svelte/icons';

	interface Props {
		goals: SavingsGoalWithProgress[];
	}

	let { goals }: Props = $props();

	const statusOrder: Record<SavingsGoalWithProgress['status'], number> = {
		active: 0,
		paused: 1,
		completed: 2,
		archived: 3
	};

	let sortedGoals = $derived(
		[...goals].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
	);

	function ringOffset(percentage: number) {
		const r = 20;
		const circumference = 2 * Math.PI * r;
		return circumference * (1 - percentage / 100);
	}

	function progressColor(goal: SavingsGoalWithProgress) {
		if (goal.status === 'completed') return 'text-green-500';
		if (goal.status === 'paused') return 'text-muted-foreground';
		if (goal.percentage >= 75) return 'text-blue-500';
		if (goal.percentage >= 40) return 'text-amber-500';
		return 'text-orange-500';
	}

	function borderColor(goal: SavingsGoalWithProgress) {
		if (goal.status === 'completed') return 'border-green-500/50';
		if (goal.status === 'paused') return 'border-muted-foreground/30 border-dashed';
		return 'border-blue-500/30';
	}

	function cardBg(goal: SavingsGoalWithProgress) {
		return goal.status === 'completed' ? 'bg-green-500/5' : '';
	}
</script>

<Card.Root>
	<Card.Header class="pb-3">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<TargetIcon class="text-muted-foreground size-4" />
				<Card.Title class="text-base">Savings Goals</Card.Title>
			</div>
			<a
				href="/savings/goals"
				class="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
			>
				View all <ExternalLinkIcon class="size-3" />
			</a>
		</div>
	</Card.Header>
	<Card.Content class="pt-0">
		{#if sortedGoals.length === 0}
			<div class="flex flex-col items-center gap-2 py-6 text-center">
				<TargetIcon class="text-muted-foreground/40 size-8" />
				<p class="text-muted-foreground text-sm">No savings goals yet</p>
				<a href="/savings/goals" class="text-primary text-xs hover:underline">Create a goal →</a>
			</div>
		{:else}
			<div class="flex gap-3 overflow-x-auto pb-1">
				{#each sortedGoals as goal (goal.id)}
					<a
						href="/savings/goals"
						class="hover:bg-muted/40 relative flex min-w-32.5 flex-col items-center gap-2 rounded-xl border-2 p-3 transition-colors {borderColor(
							goal
						)} {cardBg(goal)}"
					>
						{#if goal.status === 'paused'}
							<span
								class="bg-muted text-muted-foreground absolute top-1.5 right-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
							>
								<PauseIcon class="size-2.5" />
								Paused
							</span>
						{/if}
						<div class="relative flex h-14 w-14 items-center justify-center">
							<svg class="h-full w-full -rotate-90">
								<circle
									cx="28"
									cy="28"
									r="20"
									stroke="currentColor"
									stroke-width="4"
									fill="transparent"
									class="text-muted/50"
								/>
								<circle
									cx="28"
									cy="28"
									r="20"
									stroke="currentColor"
									stroke-width="4"
									fill="transparent"
									stroke-dasharray={2 * Math.PI * 20}
									stroke-dashoffset={ringOffset(goal.percentage)}
									class={progressColor(goal)}
									stroke-linecap="round"
								/>
							</svg>
							<div class="absolute text-xs font-bold {progressColor(goal)}">
								{#if goal.status === 'completed'}
									<CheckIcon class="size-5" />
								{:else}
									{Math.round(goal.percentage)}%
								{/if}
							</div>
						</div>
						<div class="w-full text-center">
							<p class="truncate text-xs font-medium" title={goal.name}>{goal.name}</p>
							<p class="text-muted-foreground mt-0.5 text-xs">
								{formatCurrency(goal.currentAmount)}
							</p>
							{#if goal.targetDate}
								<p class="text-muted-foreground/70 mt-0.5 text-xs">
									{formatLocalTimestamp(goal.targetDate)}
								</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
