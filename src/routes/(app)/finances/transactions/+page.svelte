<script lang="ts">
	import type { Category, Transaction } from '$lib';
	import { DataTable } from '$lib/components/ui/data-table';
	import { columns } from './columns';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import TableSkeleton from '$lib/components/TableSkeleton.svelte';
	import MonthYearSwitcher from '$lib/components/MonthYearSwitcher.svelte';
	import { getContext } from 'svelte';
	import { months } from '$lib/utils';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	interface Props {
		data: {
			transactions: Transaction[];
		};
	}

	let { data }: Props = $props();

	let openModal = $state<boolean>(false);
	let loading = $state(false);

	const currentDate = new Date();
	const defaultMonth = currentDate.getMonth() + 1;
	const defaultYear = currentDate.getFullYear();

	let selectedMonth = $derived(Number(page.url.searchParams.get('month')) || defaultMonth);
	let selectedYear = $derived(Number(page.url.searchParams.get('year')) || defaultYear);

	function onMonthYearChange(month: number, year: number) {
		goto(`?month=${month}&year=${year}`, { keepFocus: true, replaceState: true });
	}

	function onMonthJump(month: string | undefined) {
		if (month) {
			goto(`?month=${month}&year=${selectedYear}`, { keepFocus: true, replaceState: true });
		}
	}

	const categories = getContext('categories') as () => Category[];
</script>

<svelte:head>
	<title>Transactions - Sheppakai-Budget</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<div class="flex items-center justify-between">
			<div class="flex flex-col gap-4">
				<div>
					<MonthYearSwitcher
						currentMonth={selectedMonth}
						currentYear={selectedYear}
						currentType={'transactions'}
						onMonthChange={onMonthYearChange}
					/>
				</div>
			</div>
			<div class="w-44">
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
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
		<!-- Table Column (larger) -->
		<div class="lg:col-span-3">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<div class="mb-4 flex items-center justify-between">
						<div></div>
						<div class="flex items-center gap-2">
							<Button size="sm" onclick={() => (openModal = true)}>
								<PlusIcon />
								Add Transaction
							</Button>
						</div>
					</div>
					{#if loading}
						<TableSkeleton rows={5} columns={4} />
					{:else}
						<DataTable {columns} data={data.transactions as Transaction[]} />
					{/if}
				</div>
			</div>
		</div>

		<!-- Summary Card Column -->
		<div class="lg:col-span-1">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Budget Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Recurring Total</span>
						<span class="text-2xl font-bold">$0.00</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<TransactionModal bind:open={openModal} bind:isLoading={loading} categories={categories()} />
