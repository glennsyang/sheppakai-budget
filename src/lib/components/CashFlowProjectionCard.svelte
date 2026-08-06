<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Separator from '$lib/components/ui/separator/index.js';
	import { formatCurrency } from '$lib/utils';
	import { computeCashFlowProjection } from '$lib/utils/cashFlowProjection';
	import { getMonthProgress } from '$lib/utils/dates';
	import { CalendarIcon } from '@lucide/svelte/icons';

	interface Props {
		totalIncome: number;
		actualSpent: number;
		recurringMonthlyTotal: number;
		plannedExpensesTotal: number;
		month: number;
		year: number;
	}

	let {
		totalIncome,
		actualSpent,
		recurringMonthlyTotal,
		plannedExpensesTotal,
		month,
		year
	}: Props = $props();

	let projection = $derived(
		computeCashFlowProjection({
			totalIncome,
			actualSpent,
			recurringMonthlyTotal,
			plannedExpensesTotal,
			month,
			year
		})
	);

	let daysRemainingInclusive = $derived(projection.daysRemainingInclusive);
	let dailyBurnRate = $derived(projection.dailyBurnRate);
	let projectedEnd = $derived(projection.projectedEnd);
	let projectionPercent = $derived(projection.projectionPercent);
	let nonRecurringSpent = $derived(projection.nonRecurringSpent);
	let discretionaryRemaining = $derived(projection.discretionaryRemaining);
	let dailyDiscretionary = $derived(projection.dailyDiscretionary);
	let dailyBudgetRemaining = $derived(projection.dailyBudgetRemaining);
	let monthStatus = $derived(getMonthProgress(month, year).status);

	let projectionColor = $derived(
		projectedEnd > totalIncome
			? 'text-destructive'
			: projectedEnd > totalIncome * 0.9
				? 'text-amber-600 dark:text-amber-400'
				: 'text-green-600 dark:text-green-400'
	);

	let progressClass = $derived(
		projectedEnd > totalIncome
			? '[&>div]:bg-destructive'
			: projectedEnd > totalIncome * 0.9
				? '[&>div]:bg-amber-500'
				: '[&>div]:bg-green-500'
	);
</script>

<Card.Root>
	<Card.Header class="pb-3">
		<div class="flex items-center gap-2">
			<CalendarIcon class="text-muted-foreground size-4" />
			<Card.Title class="text-base">Cash Flow Projection</Card.Title>
			<InfoTooltip
				maxWidth="max-w-72"
				text="Shows where your money stands this month. The left side breaks down income, what you've spent on transactions, and recurring commitments to calculate your discretionary budget remaining. The right side projects your total spend by month-end based on your daily burn rate, and shows how much you can safely spend per day."
			/>
			<span class="text-muted-foreground ml-auto text-xs">
				{#if monthStatus === 'past'}
					Month complete
				{:else if monthStatus === 'future'}
					Not started yet
				{:else}
					{daysRemainingInclusive} day{daysRemainingInclusive === 1 ? '' : 's'} remaining
				{/if}
			</span>
		</div>
	</Card.Header>
	<Card.Content class="pt-0">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<!-- Left: breakdown -->
			<div class="space-y-0">
				<div class="flex justify-between py-2.5">
					<span class="text-muted-foreground text-sm">Monthly Income</span>
					<span class="text-sm font-semibold tabular-nums">{formatCurrency(totalIncome)}</span>
				</div>
				<Separator.Root />
				<div class="flex justify-between py-2.5">
					<span class="text-muted-foreground text-sm">Spent so far</span>
					<span class="text-sm font-semibold tabular-nums">{formatCurrency(nonRecurringSpent)}</span
					>
				</div>
				<Separator.Root />
				<div class="flex justify-between py-2.5">
					<span class="text-muted-foreground text-sm">Recurring committed</span>
					<span class="text-sm font-semibold tabular-nums"
						>{formatCurrency(recurringMonthlyTotal)}</span
					>
				</div>
				<Separator.Root />
				<div class="flex justify-between py-2.5">
					<span class="text-sm font-medium">Discretionary left</span>
					<span
						class="text-sm font-bold tabular-nums {discretionaryRemaining >= 0
							? 'text-green-600 dark:text-green-400'
							: 'text-destructive'}"
					>
						{discretionaryRemaining < 0
							? `-${formatCurrency(Math.abs(discretionaryRemaining))}`
							: formatCurrency(discretionaryRemaining)}
					</span>
				</div>
			</div>

			<!-- Right: projection -->
			<div class="flex flex-col justify-center gap-4">
				{#if monthStatus === 'current'}
					<div>
						<div class="mb-1.5 flex items-center justify-between">
							<div class="flex items-center gap-1">
								<span class="text-muted-foreground text-xs">Projected month-end spend</span>
								<InfoTooltip
									size="sm"
									text="Based on your non-recurring daily spend rate so far this month ({formatCurrency(
										dailyBurnRate
									)}/day). Recurring commitments are counted in full; this rate projects only your remaining discretionary spend."
								/>
							</div>
							<span class="text-sm font-bold tabular-nums {projectionColor}">
								{formatCurrency(projectedEnd)}
							</span>
						</div>
						<Progress value={projectionPercent} class="h-2.5 {progressClass}" />
						<p class="text-muted-foreground mt-1 text-right text-xs">
							of {formatCurrency(totalIncome)}
						</p>
					</div>

					<div class="grid grid-cols-2 gap-2">
						<div class="bg-muted/50 rounded-lg px-3 py-3">
							<div class="flex items-center gap-1">
								<p class="text-muted-foreground text-xs">Daily budget</p>
								<InfoTooltip
									size="sm"
									text="Your planned budget remaining (planned total − spent so far) divided by days left in the month. This is what your budget plan says you can spend per day."
								/>
							</div>
							<p
								class="mt-0.5 text-lg font-bold tabular-nums {dailyBudgetRemaining <= 0
									? 'text-destructive'
									: 'text-foreground'}"
							>
								{formatCurrency(dailyBudgetRemaining)}
								<span class="text-muted-foreground text-xs font-normal">/day</span>
							</p>
						</div>
						<div class="bg-muted/50 rounded-lg px-3 py-3">
							<div class="flex items-center gap-1">
								<p class="text-muted-foreground text-xs">Daily spend</p>
								<InfoTooltip
									size="sm"
									text="Discretionary left (income − spent − recurring) divided by days remaining. This is what your actual cash position allows you to spend per day."
								/>
							</div>
							<p class="mt-0.5 text-lg font-bold tabular-nums {projectionColor}">
								{formatCurrency(dailyDiscretionary)}
								<span class="text-muted-foreground text-xs font-normal">/day</span>
							</p>
						</div>
					</div>
				{:else}
					<p class="text-muted-foreground py-8 text-center text-sm">
						{monthStatus === 'past' ? 'Month complete' : 'Not started yet'}
					</p>
				{/if}
			</div>
		</div>
	</Card.Content>
</Card.Root>
