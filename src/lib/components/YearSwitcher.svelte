<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import { Button } from '$lib/components/ui/button';

	interface Props {
		currentYear: number;
		onYearChange: (year: number) => void;
	}

	let { currentYear, onYearChange }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<Button
		variant="outline"
		size="icon"
		class="h-11 w-11 md:h-9 md:w-9"
		onclick={() => onYearChange(currentYear - 1)}
	>
		<ChevronLeftIcon class="h-4 w-4" />
	</Button>
	<div class="min-w-20 text-center">
		<span class="text-base font-semibold md:text-lg">{currentYear}</span>
	</div>
	<Button
		variant="outline"
		size="icon"
		class="h-11 w-11 md:h-9 md:w-9"
		onclick={() => onYearChange(currentYear + 1)}
	>
		<ChevronRightIcon class="h-4 w-4" />
	</Button>
</div>
