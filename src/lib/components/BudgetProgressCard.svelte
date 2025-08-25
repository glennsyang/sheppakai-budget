<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';
	import { Skeleton } from '$lib/components/ui/skeleton';

	// Define props using Svelte 5 syntax
	interface $$Props {
		title: string;
		actual: number;
		planned: number;
		loading?: boolean;
		actualLabel?: string;
		plannedLabel?: string;
	}

	// Define props with defaults
	let {
		title,
		actual,
		planned,
		loading = false,
		actualLabel = 'Actual',
		plannedLabel = 'Planned'
	}: $$Props = $props();

	// Determine progress bar color based on title and comparison of actual vs planned
	let isIncome = $derived(title.toLowerCase() === 'income');
	let isGood = $derived(isIncome ? actual >= planned : actual <= planned);
	let actualProgressClass = $derived(isGood ? 'progress-good' : 'progress-bad');
</script>

<div class="overflow-hidden rounded-lg border shadow">
	<div class="p-6">
		<h2 class="mb-4 text-lg font-medium">{title}</h2>
		{#if loading}
			<Skeleton class="mb-2 h-2 w-full" />
			<Skeleton class="mb-2 h-2 w-full" />
			<Skeleton class="h-4 w-20" />
		{:else}
			<div class="mb-4">
				<div class="mb-1 flex justify-between">
					<span class="text-sm text-muted-foreground">{plannedLabel}</span>
					<span class="text-sm font-medium">${planned.toFixed(2)}</span>
				</div>
				<Progress
					value={planned === 0 ? 0 : planned}
					max={planned === 0 ? 100 : planned}
					class="mb-2"
				/>
			</div>
			<div>
				<div class="mb-1 flex justify-between">
					<span class="text-sm text-muted-foreground">{actualLabel}</span>
					<span class="text-sm font-medium">${actual.toFixed(2)}</span>
				</div>
				<Progress
					value={actual === 0 ? 0 : actual}
					max={planned === 0 ? 100 : planned}
					class={`mb-2 ${actualProgressClass}`}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.progress-good [data-slot='progress-indicator']) {
		background-color: rgb(34, 197, 94); /* Green */
	}
	:global(.progress-bad [data-slot='progress-indicator']) {
		background-color: rgb(239, 68, 68); /* Red */
	}
</style>
