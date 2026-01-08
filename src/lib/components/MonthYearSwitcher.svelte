<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	import { Button } from '$lib/components/ui/button';

	interface Props {
		currentMonth: number;
		currentYear: number;
		onMonthChange: (month: number, year: number) => void;
	}

	let { currentMonth, currentYear, onMonthChange }: Props = $props();

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function getPreviousMonth() {
		if (currentMonth === 1) {
			return { month: 12, year: currentYear - 1 };
		}
		return { month: currentMonth - 1, year: currentYear };
	}

	function getNextMonth() {
		if (currentMonth === 12) {
			return { month: 1, year: currentYear + 1 };
		}
		return { month: currentMonth + 1, year: currentYear };
	}

	function handlePrevious() {
		const { month, year } = getPreviousMonth();
		onMonthChange(month, year);
	}

	function handleNext() {
		const { month, year } = getNextMonth();
		onMonthChange(month, year);
	}

	let displayText = $derived(`${monthNames[currentMonth - 1]} ${currentYear}`);
</script>

<div class="flex items-center gap-2">
	<Button variant="outline" size="icon" class="h-11 w-11 md:h-9 md:w-9" onclick={handlePrevious}>
		<ChevronLeftIcon class="h-4 w-4" />
	</Button>
	<div class="min-w-45 text-center">
		<span class="text-base font-semibold md:text-lg">{displayText}</span>
	</div>
	<Button variant="outline" size="icon" class="h-11 w-11 md:h-9 md:w-9" onclick={handleNext}>
		<ChevronRightIcon class="h-4 w-4" />
	</Button>
</div>
