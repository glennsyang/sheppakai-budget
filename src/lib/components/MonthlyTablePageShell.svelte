<script lang="ts">
	import CardGridSkeleton from '$lib/components/CardGridSkeleton.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { months } from '$lib/utils';
	import { usePendingReload } from '$lib/utils/pendingNavigation.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		selectedMonth: number;
		selectedYear: number;
		onMonthYearChange: (month: number, year: number) => void;
		onMonthJump: (month: string | undefined) => void;
		title: string;
		description?: string;
		headerActions?: Snippet;
		topControls?: Snippet;
		tableContent: Snippet;
		summaryContent?: Snippet;
		mainClass?: string;
		tableColumnClass?: string;
		summaryColumnClass?: string;
		showSummary?: boolean;
		skeletonRows?: number;
		skeletonColumns?: number;
		skeletonSummaryCards?: number;
	}

	let {
		selectedMonth,
		selectedYear,
		onMonthYearChange,
		onMonthJump,
		title,
		description,
		headerActions,
		topControls,
		tableContent,
		summaryContent,
		mainClass = 'flex flex-col gap-6 lg:grid lg:grid-cols-4',
		tableColumnClass = 'lg:col-span-3',
		summaryColumnClass = 'lg:col-span-1',
		showSummary = true,
		skeletonRows = 8,
		skeletonColumns = 5,
		skeletonSummaryCards = 2
	}: Props = $props();

	// A month/year switch is a same-route navigation: keep the frame and the
	// controls interactive, and skeleton only the regions fed by `data`.
	const reloading = usePendingReload();
</script>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between gap-4">
				<div class="hidden md:flex">
					<MonthYearSwitcher
						currentMonth={selectedMonth}
						currentYear={selectedYear}
						onMonthChange={onMonthYearChange}
					/>
				</div>
				<div class="w-full md:w-44">
					<Select.Root type="single" value={selectedMonth.toString()} onValueChange={onMonthJump}>
						<Select.Trigger class="w-full">
							{months.find((m) => m.value === selectedMonth.toString())?.label || 'Jump to Month'}
						</Select.Trigger>
						<Select.Content>
							<Select.Label>Jump to Month</Select.Label>
							{#each months as month (month.value)}
								<Select.Item value={month.value} label={month.label}>
									{month.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
			</div>
			{#if topControls}
				{@render topControls()}
			{/if}
		</div>
	</div>

	<div class={mainClass}>
		<div class={tableColumnClass}>
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div>
							<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
							{#if description}
								<p class="text-muted-foreground mt-2">{description}</p>
							{/if}
						</div>
						{#if headerActions}
							<div class="flex items-center gap-2">
								{@render headerActions()}
							</div>
						{/if}
					</div>
					{#if reloading.current}
						<TableSkeleton rows={skeletonRows} columns={skeletonColumns} />
					{:else}
						{@render tableContent()}
					{/if}
				</div>
			</div>
		</div>

		{#if showSummary && summaryContent}
			<div class={summaryColumnClass}>
				{#if reloading.current}
					<CardGridSkeleton
						cards={skeletonSummaryCards}
						class="flex flex-col gap-6"
						label="Loading summary"
					/>
				{:else}
					{@render summaryContent()}
				{/if}
			</div>
		{/if}
	</div>
</div>
