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
				<Progress value={planned} max={planned} class="mb-2" />
			</div>
			<div>
				<div class="mb-1 flex justify-between">
					<span class="text-sm text-muted-foreground">{actualLabel}</span>
					<span class="text-sm font-medium">${actual.toFixed(2)}</span>
				</div>
				<Progress value={actual} max={planned} class="mb-2" />
			</div>
		{/if}
	</div>
</div>
