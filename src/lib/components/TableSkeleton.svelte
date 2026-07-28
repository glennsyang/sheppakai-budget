<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		rows?: number;
		columns?: number;
	}

	let { rows = 5, columns = 5 }: Props = $props();

	// Generate column widths with some variety
	const columnWidths = ['w-24', 'w-32', 'w-20', 'w-28', 'w-16', 'w-36'];

	function getColumnWidth(index: number): string {
		return columnWidths[index % columnWidths.length];
	}
</script>

<div class="space-y-4" role="status">
	<span class="sr-only">Loading table data</span>

	<!-- Table header skeleton -->
	<div class="flex space-x-4">
		{#each Array.from({ length: columns }) as _col, i (i)}
			<Skeleton class="h-6 {getColumnWidth(i)}" />
		{/each}
	</div>

	<!-- Table rows skeleton -->
	{#each Array.from({ length: rows }) as _row, rowIndex (rowIndex)}
		<div class="flex space-x-4">
			{#each Array.from({ length: columns }) as _col2, colIndex (`${rowIndex}-${colIndex}`)}
				<Skeleton class="h-4 {getColumnWidth(colIndex)}" />
			{/each}
		</div>
	{/each}
</div>
