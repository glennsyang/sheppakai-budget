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

<div class="bg-card overflow-hidden rounded-xl border shadow-sm" role="status">
	<span class="sr-only">Loading table data</span>

	<!-- Table header skeleton -->
	<div class="flex h-10 items-center gap-6 border-b px-4 lg:px-5">
		{#each Array.from({ length: columns }) as _col, i (i)}
			<Skeleton class="h-3 {getColumnWidth(i)}" />
		{/each}
	</div>

	<!-- Table rows skeleton -->
	<div class="divide-y">
		{#each Array.from({ length: rows }) as _row, rowIndex (rowIndex)}
			<div class="flex h-12 items-center gap-6 px-4 lg:px-5">
				{#each Array.from({ length: columns }) as _col2, colIndex (`${rowIndex}-${colIndex}`)}
					<Skeleton class="h-3.5 {getColumnWidth(colIndex)}" />
				{/each}
			</div>
		{/each}
	</div>
</div>
