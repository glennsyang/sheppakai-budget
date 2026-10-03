<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import type { ExcludedSpendCategory } from '$lib/types';
	import { formatCurrency } from '$lib/utils';
	import { computeCashFlowProjection } from '$lib/utils/cashFlowProjection';
	import { getMonthProgress } from '$lib/utils/dates';

	interface Props {
		/** Total spent including recurring. */
		actualSpent: number;
		plannedBudget: number;
		totalIncome: number;
		recurringTotal?: number;
		excludedSpendTotal?: number;
		excludedSpendBreakdown?: ExcludedSpendCategory[];
		netTrendLabel?: string;
		showProjection?: boolean;
		loading?: boolean;
		month: number;
		year: number;
	}

	let {
		actualSpent,
		plannedBudget,
		totalIncome,
		recurringTotal = 0,
		excludedSpendTotal = 0,
		excludedSpendBreakdown = [],
		netTrendLabel,
		showProjection = true,
		loading = false,
		month,
		year
	}: Props = $props();

	let monthStatus = $derived(getMonthProgress(month, year).status);
	let discretionarySpent = $derived(Math.max(0, actualSpent - recurringTotal));
	let discretionaryBudget = $derived(Math.max(0, plannedBudget - recurringTotal));
	let budgetPct = $derived(
		discretionaryBudget > 0 ? (discretionarySpent / discretionaryBudget) * 100 : 0
	);
	let netBalance = $derived(totalIncome - actualSpent);
	let isOverspent = $derived(netBalance < 0);

	let projection = $derived(
		computeCashFlowProjection({
			totalIncome,
			actualSpent,
			recurringMonthlyTotal: recurringTotal,
			plannedExpensesTotal: plannedBudget,
			month,
			year
		})
	);

	let statusLabel = $derived(
		monthStatus === 'past'
			? isOverspent
				? 'Overspent'
				: 'Stayed on track'
			: monthStatus === 'future'
				? isOverspent
					? 'Projected to overspend'
					: 'Projected to stay on track'
				: isOverspent
					? 'Overspent this month'
					: 'On track this month'
	);

	function fillTone(pct: number) {
		if (pct > 100) return 'bg-destructive';
		if (pct >= 90) return 'bg-warning';
		return 'bg-foreground/55';
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-base tracking-tight">Monthly overview</Card.Title>
		<Card.Description>Income less everything spent.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col gap-6">
		{#if loading}
			<div class="space-y-3">
				<div class="bg-muted h-24 animate-pulse rounded-lg"></div>
				<div class="bg-muted h-12 animate-pulse rounded-lg"></div>
			</div>
		{:else}
			<dl class="text-sm">
				<div class="flex justify-between py-1.5">
					<dt class="text-muted-foreground">Income</dt>
					<dd class="font-medium tabular-nums">{formatCurrency(totalIncome)}</dd>
				</div>
				<div class="flex justify-between py-1.5">
					<dt class="text-muted-foreground">Recurring</dt>
					<dd class="font-medium tabular-nums">
						{recurringTotal > 0 ? '−' : ''}{formatCurrency(recurringTotal)}
					</dd>
				</div>
				<div class="flex justify-between py-1.5">
					<dt class="text-muted-foreground">Discretionary spent</dt>
					<dd class="font-medium tabular-nums">
						{discretionarySpent > 0 ? '−' : ''}{formatCurrency(discretionarySpent)}
					</dd>
				</div>
				<div class="mt-1.5 flex items-baseline justify-between gap-3 border-t pt-3">
					<dt>
						<span class="font-medium">Net</span>
						<span
							class={[
								'ms-2 text-xs font-medium',
								isOverspent ? 'text-destructive' : 'text-positive'
							]}>{statusLabel}</span
						>
					</dt>
					<dd
						class={[
							'text-lg font-semibold tracking-tight tabular-nums',
							isOverspent ? 'text-destructive' : 'text-positive'
						]}
					>
						{isOverspent ? '−' : '+'}{formatCurrency(Math.abs(netBalance))}
					</dd>
				</div>
				{#if netTrendLabel}
					<p class="text-muted-foreground text-right text-xs tabular-nums">{netTrendLabel}</p>
				{/if}
				{#if excludedSpendTotal > 0}
					<div class="text-muted-foreground mt-3 flex justify-between gap-3 text-xs">
						<dt class="flex min-w-0 items-center gap-1">
							<span class="truncate"
								>Not counted: {excludedSpendBreakdown.map((c) => c.categoryName).join(', ')}</span
							>
							<InfoTooltip
								size="sm"
								text="Spending in categories excluded from the budget. It still leaves your account but isn't counted against income or budget here."
							/>
						</dt>
						<dd class="shrink-0 tabular-nums">{formatCurrency(excludedSpendTotal)}</dd>
					</div>
				{/if}
			</dl>

			<div class="space-y-2">
				<div class="flex items-baseline justify-between text-sm">
					<span class="font-medium">Discretionary budget</span>
					<span class="text-muted-foreground text-xs tabular-nums">
						{formatCurrency(discretionarySpent)} of {formatCurrency(discretionaryBudget)}
					</span>
				</div>
				<div class="bg-track h-1.5 overflow-hidden rounded-full" aria-hidden="true">
					<div
						class={['h-full rounded-full', fillTone(budgetPct)]}
						style="width: {Math.min(budgetPct, 100)}%"
					></div>
				</div>
				{#if discretionaryBudget > 0}
					<p class="text-xs">
						{#if discretionarySpent > discretionaryBudget}
							<span class="text-destructive font-medium tabular-nums"
								>Over by {formatCurrency(discretionarySpent - discretionaryBudget)}</span
							>
						{:else}
							<span class="font-medium tabular-nums"
								>{formatCurrency(discretionaryBudget - discretionarySpent)}</span
							>
							<span class="text-muted-foreground">{monthStatus === 'past' ? 'unused' : 'left'}</span
							>
						{/if}
					</p>
				{/if}
			</div>

			{#if showProjection && monthStatus === 'current'}
				<dl class="grid grid-cols-3 gap-4 border-t pt-4 text-xs">
					<div>
						<dt class="text-muted-foreground flex items-center gap-1">
							Month-end
							<InfoTooltip
								size="sm"
								text="Projected total spend at month end if your daily discretionary rate holds, plus recurring."
							/>
						</dt>
						<dd
							class={[
								'mt-1 text-sm font-semibold tabular-nums',
								totalIncome > 0 && projection.projectedEnd > totalIncome && 'text-destructive'
							]}
						>
							{formatCurrency(projection.projectedEnd)}
						</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Spending /day</dt>
						<dd class="mt-1 text-sm font-semibold tabular-nums">
							{formatCurrency(projection.dailyBurnRate)}
						</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Budget left /day</dt>
						<dd class="mt-1 text-sm font-semibold tabular-nums">
							{formatCurrency(projection.dailyBudgetRemaining)}
						</dd>
					</div>
				</dl>
			{/if}
		{/if}
	</Card.Content>
</Card.Root>
