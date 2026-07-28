<script lang="ts">
	import { Skeleton } from '$lib/components/ui/skeleton';

	interface Props {
		/** Number of card placeholders to render. */
		cards?: number;
		/** Grid/flex classes for the container, supplied by the caller so the
		 * placeholder occupies the same footprint as the content it replaces. */
		class?: string;
		/** Body lines inside each card, below the title bar. */
		linesPerCard?: number;
		/** Height of each card's body lines, e.g. `h-4` for text, `h-40` for a chart. */
		lineClass?: string;
		/** Accessible description of what is loading. */
		label?: string;
	}

	let {
		cards = 2,
		class: className = 'flex flex-col gap-6',
		linesPerCard = 2,
		lineClass = 'h-4',
		label = 'Loading'
	}: Props = $props();
</script>

<div class={className} role="status">
	<span class="sr-only">{label}</span>

	{#each Array.from({ length: cards }) as _card, cardIndex (cardIndex)}
		<div class="overflow-hidden rounded-lg border shadow">
			<div class="space-y-4 p-6">
				<Skeleton class="mx-auto h-6 w-40" />
				<div class="border-t"></div>
				{#each Array.from({ length: linesPerCard }) as _line, lineIndex (lineIndex)}
					<Skeleton class="{lineClass} w-full" />
				{/each}
			</div>
		</div>
	{/each}
</div>
