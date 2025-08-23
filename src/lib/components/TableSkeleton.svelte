<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		rows?: number;
		columns?: number;
	}

	let { rows = 5, columns = 5 }: Props = $props();

	// Generate column widths with some variety
	const columnWidths = ['w-24', 'w-32', 'w-20', 'w-28', 'w-16', 'w-36', 'w-18', 'w-30'];

	function getColumnWidth(index: number): string {
		return columnWidths[index % columnWidths.length];
	}
</script>

<div class="space-y-4">
	<!-- Table header skeleton -->
	<div class="flex space-x-4">
		{#each Array(columns) as _, i}
			<Skeleton class="h-6 {getColumnWidth(i)}" />
		{/each}
	</div>

	<!-- Table rows skeleton -->
	{#each Array(rows) as _, rowIndex}
		<div class="flex space-x-4">
			{#each Array(columns) as _, colIndex}
				<Skeleton class="h-4 {getColumnWidth(colIndex)}" />
			{/each}
		</div>
	{/each}
</div>
