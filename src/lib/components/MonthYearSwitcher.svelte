<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

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
	<Button variant="outline" size="icon" onclick={handlePrevious}>
		<ChevronLeftIcon class="h-4 w-4" />
	</Button>
	<div class="min-w-[180px] text-center">
		<span class="text-lg font-semibold">{displayText}</span>
	</div>
	<Button variant="outline" size="icon" onclick={handleNext}>
		<ChevronRightIcon class="h-4 w-4" />
	</Button>
</div>
