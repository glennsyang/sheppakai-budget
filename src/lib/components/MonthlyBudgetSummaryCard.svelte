<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		actualSpent: number;
		plannedBudget: number;
		totalIncome: number;
		recurringTotal?: number;
		loading?: boolean;
	}

	let {
		actualSpent,
		plannedBudget,
		totalIncome,
		recurringTotal = 0,
		loading = false
	}: Props = $props();

	let nonRecurringSpent = $derived(Math.max(0, actualSpent - recurringTotal));
	let budgetPct = $derived(plannedBudget > 0 ? (actualSpent / plannedBudget) * 100 : 0);
	let incomePct = $derived(totalIncome > 0 ? (actualSpent / totalIncome) * 100 : 0);
	let netBalance = $derived(totalIncome - actualSpent);
	let isOverspent = $derived(netBalance < 0);

	function progressClass(pct: number): string {
		if (pct > 100) return 'progress-over';
		if (pct >= 90) return 'progress-warning';
		return 'progress-under';
	}
</script>

<Card.Root class="bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	<Card.Header>
		<Card.Title class="text-base font-medium text-muted-foreground">Monthly Overview</Card.Title>
	</Card.Header>
	<Card.Content class="pb-4">
		{#if loading}
			<div class="space-y-4">
				<div class="h-20 animate-pulse rounded-lg bg-muted"></div>
				<div class="h-20 animate-pulse rounded-lg bg-muted"></div>
			</div>
		{:else}
			<!-- Hero net balance -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Net Balance</p>
					<p
						class={`text-4xl font-bold tracking-tight tabular-nums ${isOverspent ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}
					>
						{isOverspent ? '-' : '+'}{formatCurrency(Math.abs(netBalance))}
					</p>
					<p
						class={`mt-1 text-xs font-medium ${isOverspent ? 'text-destructive' : 'text-green-600 dark:text-green-400'}`}
					>
						{isOverspent ? 'Overspent this month' : 'On track this month'}
					</p>
				</div>
				<div
					class={`flex h-16 w-16 items-center justify-center rounded-full text-2xl ${isOverspent ? 'bg-destructive/10' : 'bg-green-100 dark:bg-green-900/30'}`}
				>
					{isOverspent ? '⚠️' : '✓'}
				</div>
			</div>

			<!-- Two columns: vs Budget | vs Income -->
			<div class="grid grid-cols-2 gap-4">
				<!-- vs Budget -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">vs Budget</span>
						<span class="text-muted-foreground tabular-nums">{budgetPct.toFixed(0)}%</span>
					</div>
					<Progress
						value={actualSpent}
						max={plannedBudget > 0 ? plannedBudget : 100}
						class={progressClass(budgetPct)}
					/>
					<div class="space-y-0.5">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Recurring</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(recurringTotal)}</span
							>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Spent</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(nonRecurringSpent)}</span
							>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Budget</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(plannedBudget)}</span
							>
						</div>
						{#if actualSpent > plannedBudget && plannedBudget > 0}
							<p class="text-xs font-medium text-destructive">
								Over by {formatCurrency(actualSpent - plannedBudget)}
							</p>
						{:else if plannedBudget > 0}
							<p class="text-xs font-medium text-green-600 dark:text-green-400">
								{formatCurrency(plannedBudget - actualSpent)} left
							</p>
						{/if}
					</div>
				</div>

				<!-- vs Income -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">vs Income</span>
						<span class="text-muted-foreground tabular-nums">{incomePct.toFixed(0)}%</span>
					</div>
					<Progress
						value={actualSpent}
						max={totalIncome > 0 ? totalIncome : 100}
						class={progressClass(incomePct)}
					/>
					<div class="space-y-0.5">
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Recurring</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(recurringTotal)}</span
							>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Spent</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(nonRecurringSpent)}</span
							>
						</div>
						<div class="flex justify-between text-xs text-muted-foreground">
							<span>Income</span>
							<span class="font-medium text-foreground tabular-nums"
								>{formatCurrency(totalIncome)}</span
							>
						</div>
						{#if actualSpent > totalIncome && totalIncome > 0}
							<p class="text-xs font-medium text-destructive">
								Over income by {formatCurrency(actualSpent - totalIncome)}
							</p>
						{:else if totalIncome > 0}
							<p class="text-xs font-medium text-green-600 dark:text-green-400">
								{formatCurrency(totalIncome - actualSpent)} remaining
							</p>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<style>
	:global(.progress-under [data-slot='progress-indicator']) {
		background-color: rgb(34, 197, 94);
	}
	:global(.progress-warning [data-slot='progress-indicator']) {
		background-color: rgb(234, 179, 8);
	}
	:global(.progress-over [data-slot='progress-indicator']) {
		background-color: rgb(239, 68, 68);
	}
</style>
