<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';

	// Define props using Svelte 5 syntax
	interface $$Props {
		title: string;
		actual: number;
		planned: number;
		loading?: boolean;
		label1?: string;
		label2?: string;
	}

	// Define props with defaults
	let {
		title,
		actual,
		planned,
		loading = false,
		label1 = 'Budget',
		label2 = 'Spent'
	}: $$Props = $props();

	// Calculate percentage with 2 decimal places
	let percentage = $derived(planned > 0 ? (actual / planned) * 100 : 0);
	let isOverBudget = $derived(actual > planned && planned > 0);
	let isUnderBudget = $derived(actual < planned && planned > 0);
	let overage = $derived(isOverBudget ? actual - planned : 0);
	let underage = $derived(isUnderBudget ? planned - actual : 0);
	let progressClass = $derived(isOverBudget ? 'progress-over' : 'progress-under');
</script>

<div class="overflow-hidden rounded-lg border shadow">
	<div class="p-6">
		<h2 class="mb-4 text-lg font-medium">{title}</h2>
		{#if loading}
			<Skeleton class="mb-2 h-4 w-full" />
			<Skeleton class="mb-2 h-2 w-full" />
			<Skeleton class="h-4 w-20" />
		{:else}
			<div class="mb-2">
				<span class="text-sm text-muted-foreground">{label1}: ${planned.toFixed(2)}</span>
				<div class="mb-1 flex items-baseline justify-between">
					<span class="text-sm text-muted-foreground">{label2}: ${actual.toFixed(2)}</span>
					<span class="text-sm font-semibold">{percentage.toFixed(2)}%</span>
				</div>
			</div>
			<Progress
				value={actual === 0 ? 0 : actual}
				max={planned === 0 ? 100 : planned}
				class={progressClass}
			/>
			{#if isOverBudget}
				<p class="mt-2 text-sm font-medium text-red-600">
					Over budget by ${overage.toFixed(2)}
				</p>
			{:else if isUnderBudget}
				<p class="mt-2 text-sm font-medium text-green-600">
					Remaining: ${underage.toFixed(2)}
				</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	:global(.progress-under [data-slot='progress-indicator']) {
		background-color: rgb(34, 197, 94); /* Green */
	}
	:global(.progress-over [data-slot='progress-indicator']) {
		background-color: rgb(239, 68, 68); /* Red */
	}
</style>
