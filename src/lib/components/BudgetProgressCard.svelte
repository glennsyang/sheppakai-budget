<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { formatCurrency } from '$lib/utils';

	// Define props using Svelte 5 syntax
	interface $$Props {
		title: string;
		actual: number;
		planned: number;
		loading?: boolean;
		label1?: string;
	}

	// Define props with defaults
	let { title, actual, planned, loading = false, label1 = 'Spent' }: $$Props = $props();

	// Calculate percentage with 2 decimal places
	let percentage = $derived(planned > 0 ? (actual / planned) * 100 : 0);
	let isOverBudget = $derived(actual > planned && planned > 0);
	let isUnderBudget = $derived(actual < planned && planned > 0);
	let overage = $derived(isOverBudget ? actual - planned : 0);
	let underage = $derived(isUnderBudget ? planned - actual : 0);
	let progressClass = $derived(isOverBudget ? 'progress-over' : 'progress-under');
</script>

<Card.Root class="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
	{#if loading}
		<Skeleton class="mb-2 h-4 w-full" />
		<Skeleton class="mb-2 h-2 w-full" />
		<Skeleton class="h-4 w-20" />
	{:else}
		<Card.Header>
			<Card.Description>{title}</Card.Description>
			<Card.Title class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
				{formatCurrency(planned)}
			</Card.Title>
			<Card.Action>
				<Badge variant="outline">
					{percentage.toFixed(1)}%
				</Badge>
			</Card.Action>
		</Card.Header>
		<Card.Footer class="flex-col items-start gap-1.5 text-sm">
			<Progress
				value={actual === 0 ? 0 : actual}
				max={planned === 0 ? 100 : planned}
				class={progressClass}
			/>
			<div class="mt-2">
				<span class="text-sm text-muted-foreground">{label1}: {formatCurrency(actual)}</span>
			</div>
			{#if isOverBudget}
				<p class="text-sm font-medium text-red-600">
					Over budget by {formatCurrency(overage)}
				</p>
			{:else if isUnderBudget}
				<p class="text-sm font-medium text-green-600">
					Remaining: {formatCurrency(underage)}
				</p>
			{/if}
		</Card.Footer>
	{/if}
</Card.Root>

<style>
	:global(.progress-under [data-slot='progress-indicator']) {
		background-color: rgb(34, 197, 94); /* Green */
	}
	:global(.progress-over [data-slot='progress-indicator']) {
		background-color: rgb(239, 68, 68); /* Red */
	}
</style>
