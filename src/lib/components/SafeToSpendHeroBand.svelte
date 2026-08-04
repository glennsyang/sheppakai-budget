<script lang="ts">
	import InfoTooltip from '$lib/components/InfoTooltip.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/utils';
	import { getMonthProgress } from '$lib/utils/dates';
	import { WalletIcon } from '@lucide/svelte/icons';

	interface Props {
		dailyDiscretionary: number;
		netBalance: number;
		daysRemainingInclusive: number;
		month: number;
		year: number;
	}

	let { dailyDiscretionary, netBalance, daysRemainingInclusive, month, year }: Props = $props();

	let netBalanceColor = $derived(
		netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
	);
	let monthStatus = $derived(getMonthProgress(month, year).status);
</script>

<Card.Root class="from-primary/5 to-card dark:bg-card bg-linear-to-t shadow-xs">
	<Card.Content
		class="flex flex-col items-start justify-between gap-4 py-2 sm:flex-row sm:items-center"
	>
		<div class="flex items-center gap-3">
			<div class="bg-primary/10 flex size-12 items-center justify-center rounded-full">
				<WalletIcon class="text-primary size-6" />
			</div>
			<div>
				<div class="flex items-center gap-1">
					<p class="text-muted-foreground text-sm">Safe to Spend Today</p>
					<InfoTooltip
						size="sm"
						text="Discretionary left (income − spent − recurring) divided by days remaining in the month. What your actual cash position allows you to spend per day."
					/>
				</div>
				<p class="text-3xl font-bold tabular-nums">
					{formatCurrency(dailyDiscretionary)}
					<span class="text-muted-foreground text-sm font-normal">/day</span>
				</p>
			</div>
		</div>
		<div class="text-left sm:text-right">
			<p class="text-muted-foreground text-sm">Net Position</p>
			<p class="text-xl font-bold tabular-nums {netBalanceColor}">
				{netBalance < 0 ? '-' : ''}{formatCurrency(Math.abs(netBalance))}
			</p>
			<p class="text-muted-foreground text-xs">
				{#if monthStatus === 'past'}
					Month complete
				{:else if monthStatus === 'future'}
					Not started yet
				{:else}
					{daysRemainingInclusive} day{daysRemainingInclusive === 1 ? '' : 's'} left
				{/if}
			</p>
		</div>
	</Card.Content>
</Card.Root>
