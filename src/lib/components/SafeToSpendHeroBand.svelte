<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import SpendPaceChart from '$lib/components/SpendPaceChart.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency, monthNames } from '$lib/utils';
	import { getMonthProgress } from '$lib/utils/dates';

	interface Props {
		dailyDiscretionary: number;
		discretionaryRemaining: number;
		netBalance: number;
		daysRemainingInclusive: number;
		daysInMonth: number;
		discretionaryExpenses: { date: string; amount: number }[];
		discretionaryBudget: number;
		month: number;
		year: number;
	}

	let {
		dailyDiscretionary,
		discretionaryRemaining,
		netBalance,
		daysRemainingInclusive,
		daysInMonth,
		discretionaryExpenses,
		discretionaryBudget,
		month,
		year
	}: Props = $props();

	let monthStatus = $derived(getMonthProgress(month, year).status);
	let throughDay = $derived(
		monthStatus === 'past'
			? daysInMonth
			: monthStatus === 'future'
				? 0
				: daysInMonth - daysRemainingInclusive + 1
	);

	let discretionarySpent = $derived(discretionaryExpenses.reduce((sum, e) => sum + e.amount, 0));
	let budgetResult = $derived(discretionaryBudget - discretionarySpent);
</script>

<Card.Root class="gap-0 overflow-hidden py-0">
	<div class="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
		<div class="flex flex-col justify-center p-5 sm:p-6 lg:p-8">
			{#if monthStatus === 'current'}
				<div class="text-muted-foreground flex items-center gap-1 text-sm">
					<h2>Safe to spend today</h2>
					<InfoTooltip
						size="sm"
						text="Discretionary left (income − spent − recurring) divided by days remaining in the month. What your actual cash position allows you to spend per day."
					/>
				</div>
				<p
					class="mt-2 text-[2.75rem] leading-none font-semibold tracking-[-0.035em] tabular-nums sm:text-[3.5rem]"
				>
					{formatCurrency(dailyDiscretionary)}<span
						class="text-muted-foreground ms-1 text-base font-normal tracking-normal">/day</span
					>
				</p>
				<p class="mt-3 text-sm">
					{#if discretionaryRemaining < 0}
						<span class="text-destructive font-medium tabular-nums"
							>{formatCurrency(-discretionaryRemaining)} past this month's income</span
						>
						<span class="text-muted-foreground">with {daysRemainingInclusive} days to go.</span>
					{:else}
						<span class="font-medium tabular-nums">{formatCurrency(discretionaryRemaining)}</span>
						<span class="text-muted-foreground"
							>left to spend over {daysRemainingInclusive} day{daysRemainingInclusive === 1
								? ''
								: 's'}.</span
						>
					{/if}
				</p>
			{:else if monthStatus === 'past' && discretionaryBudget > 0}
				<h2 class="text-muted-foreground text-sm">{monthNames[month - 1]} finished</h2>
				<p
					class={[
						'mt-2 text-[2.75rem] leading-none font-semibold tracking-[-0.035em] tabular-nums sm:text-[3.5rem]',
						budgetResult < 0 && 'text-destructive'
					]}
				>
					{formatCurrency(Math.abs(budgetResult))}
				</p>
				<p class="mt-3 text-sm">
					<span class={['font-medium', budgetResult < 0 ? 'text-destructive' : 'text-positive']}
						>{budgetResult < 0 ? 'Over' : 'Under'} the discretionary budget</span
					>
					<span class="text-muted-foreground tabular-nums"
						>of {formatCurrency(discretionaryBudget)}.</span
					>
				</p>
			{:else if monthStatus === 'past'}
				<h2 class="text-muted-foreground text-sm">{monthNames[month - 1]} finished</h2>
				<p
					class={[
						'mt-2 text-[2.75rem] leading-none font-semibold tracking-[-0.035em] tabular-nums sm:text-[3.5rem]',
						netBalance < 0 && 'text-destructive'
					]}
				>
					{netBalance < 0 ? '−' : '+'}{formatCurrency(Math.abs(netBalance))}
				</p>
				<p class="text-muted-foreground mt-3 text-sm">
					Net for the month, income less all spending.
				</p>
			{:else}
				<h2 class="text-muted-foreground text-sm">Discretionary budget</h2>
				<p
					class="mt-2 text-[2.75rem] leading-none font-semibold tracking-[-0.035em] tabular-nums sm:text-[3.5rem]"
				>
					{formatCurrency(discretionaryBudget)}
				</p>
				<p class="text-muted-foreground mt-3 text-sm">{monthNames[month - 1]} hasn't started.</p>
			{/if}
		</div>

		<div class="bg-muted/40 border-t p-5 sm:p-6 lg:border-t-0 lg:border-l">
			<SpendPaceChart
				expenses={discretionaryExpenses}
				budget={discretionaryBudget}
				{month}
				{daysInMonth}
				{throughDay}
				complete={monthStatus === 'past'}
			/>
		</div>
	</div>
</Card.Root>
