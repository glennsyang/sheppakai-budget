<script lang="ts">
	import { Progress } from '$lib/components/ui/progress';

	interface Props {
		categoryName: string;
		spent: number;
		budgeted: number;
	}

	let { categoryName, spent, budgeted }: Props = $props();

	let percentage = $derived(budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0);
	let isOverBudget = $derived(spent > budgeted);
	let progressClass = $derived(isOverBudget ? 'progress-over-budget' : 'progress-under-budget');
</script>

<div class="mb-4">
	<div class="mb-1 flex items-center justify-between">
		<span class="text-sm font-medium">{categoryName}</span>
		<span class="text-sm font-semibold">{percentage}%</span>
	</div>
	<Progress value={spent} max={budgeted} class={progressClass} />
</div>

<style>
	:global(.progress-under-budget [data-slot='progress-indicator']) {
		background-color: rgb(34, 197, 94); /* Green */
	}
	:global(.progress-over-budget [data-slot='progress-indicator']) {
		background-color: rgb(239, 68, 68); /* Red */
	}
</style>
