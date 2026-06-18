<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import { formatCurrency } from '$lib/utils';

	interface Props {
		actualSpent: number;
		plannedBudget: number;
		totalIncome: number;
		recurringTotal?: number;
		excludedSpendTotal?: number;
		loading?: boolean;
	}

	let {
		actualSpent,
		plannedBudget,
		totalIncome,
		recurringTotal = 0,
		excludedSpendTotal = 0,
		loading = false
	}: Props = $props();

	let nonRecurringSpent = $derived(Math.max(0, actualSpent - recurringTotal));
	let nonRecurringBudget = $derived(Math.max(0, plannedBudget - recurringTotal));
	let nonRecurringBudgetPct = $derived(
		nonRecurringBudget > 0 ? (nonRecurringSpent / nonRecurringBudget) * 100 : 0
	);
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

<Card.Root class="from-primary/5 to-card dark:bg-card bg-linear-to-t shadow-xs">
	<Card.Header>
		<Card.Title class="text-muted-foreground text-base font-medium">Monthly Overview</Card.Title>
	</Card.Header>
	<Card.Content class="pb-4">
		{#if loading}
			<div class="space-y-4">
				<div class="bg-muted h-20 animate-pulse rounded-lg"></div>
				<div class="bg-muted h-20 animate-pulse rounded-lg"></div>
			</div>
		{:else}
			<!-- Hero net balance -->
			<div class="mb-6 flex items-center justify-between">
				<div>
					<p class="text-muted-foreground text-sm">Net Balance</p>
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

			{#if excludedSpendTotal > 0}
				<div
					class="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900/50 dark:bg-amber-950/40"
				>
					<p class="font-medium text-amber-900 dark:text-amber-200">
						Excluded from budget: {formatCurrency(excludedSpendTotal)}
					</p>
					<p class="mt-0.5 text-amber-700 dark:text-amber-300">
						Tracked separately and not counted in budget usage.
					</p>
				</div>
			{/if}

			<!-- Two columns: vs Budget | vs Income -->
			<div class="grid grid-cols-2 gap-4">
				<!-- vs Budget -->
				<div class="space-y-2">
					<div class="flex items-center justify-between text-sm">
						<span class="font-medium">vs Budget</span>
						<div class="text-right">
							<span class="text-muted-foreground tabular-nums">{budgetPct.toFixed(0)}%</span>
							{#if nonRecurringBudget > 0}
								<p class="text-muted-foreground text-xs tabular-nums">
									{nonRecurringBudgetPct.toFixed(0)}% excl. recurring
								</p>
							{/if}
						</div>
					</div>
					<Progress
						value={actualSpent}
						max={plannedBudget > 0 ? plannedBudget : 100}
						class={progressClass(budgetPct)}
					/>
					<div class="space-y-0.5">
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Recurring</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(recurringTotal)}</span
							>
						</div>
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Spent</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(nonRecurringSpent)}</span
							>
						</div>
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Budget</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(plannedBudget)}</span
							>
						</div>
						{#if actualSpent > plannedBudget && plannedBudget > 0}
							<p class="text-destructive text-xs font-medium">
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
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Recurring</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(recurringTotal)}</span
							>
						</div>
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Spent</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(nonRecurringSpent)}</span
							>
						</div>
						<div class="text-muted-foreground flex justify-between text-xs">
							<span>Income</span>
							<span class="text-foreground font-medium tabular-nums"
								>{formatCurrency(totalIncome)}</span
							>
						</div>
						{#if actualSpent > totalIncome && totalIncome > 0}
							<p class="text-destructive text-xs font-medium">
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
