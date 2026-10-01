<script lang="ts">
	import type { Transaction } from '$lib';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import type { transactionSchema } from '$lib/formSchemas';
	import { formatCurrency } from '$lib/utils';
	import { useMonthYearParams } from '$lib/utils/monthYearParams.svelte';
	import type { createReceiptColumns } from '$lib/utils/receipt-columns';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { Snippet } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	interface Props {
		title: string;
		description: string;
		basePath: string;
		columns: ReturnType<typeof createReceiptColumns>;
		// Label for the amount rows in both summaries, e.g. "Total Amount".
		amountLabel: string;
		monthlyTransactions: Transaction[];
		yearlyTransactions: Transaction[];
		form?: SuperValidated<z.infer<typeof transactionSchema>>;
		loadError?: string;
		// Extra rows rendered in the yearly summary between the amount and GST rows.
		yearlyExtra?: Snippet<[yearlyTotalAmount: number]>;
	}

	let {
		title,
		description,
		basePath,
		columns,
		amountLabel,
		monthlyTransactions,
		yearlyTransactions,
		form,
		loadError,
		yearlyExtra
	}: Props = $props();

	// svelte-ignore state_referenced_locally
	if (form) {
		transactionFormContext.set(form);
	}

	let openModal = $state<boolean>(false);

	const sumAmount = (items: Transaction[]) => (items || []).reduce((sum, t) => sum + t.amount, 0);
	const sumGst = (items: Transaction[]) =>
		(items || []).reduce((sum, t) => sum + (t.gstAmount ?? 0), 0);

	let monthlyTotalAmount = $derived(sumAmount(monthlyTransactions));
	let monthlyTotalGst = $derived(sumGst(monthlyTransactions));
	let yearlyTotalAmount = $derived(sumAmount(yearlyTransactions));
	let yearlyTotalGst = $derived(sumGst(yearlyTransactions));

	// svelte-ignore state_referenced_locally
	const monthYear = useMonthYearParams(basePath);

	const categories = getCategoriesContext();
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<MonthlyTablePageShell
	{title}
	{loadError}
	{description}
	selectedMonth={monthYear.month}
	selectedYear={monthYear.year}
	onMonthYearChange={monthYear.onMonthYearChange}
	onMonthJump={monthYear.onMonthJump}
	mainClass="flex flex-col gap-6 lg:grid lg:grid-cols-4"
	tableColumnClass="lg:col-span-3"
	summaryColumnClass="lg:col-span-1"
	skeletonColumns={columns.length}
>
	{#snippet headerActions()}
		<Button size="sm" onclick={() => (openModal = true)}>
			<PlusIcon />
			Add
		</Button>
	{/snippet}

	{#snippet tableContent()}
		<DataTable {columns} data={monthlyTransactions} />
	{/snippet}

	{#snippet summaryContent()}
		<div class="flex flex-col gap-6">
			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Monthly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">{amountLabel}:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalAmount)}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(monthlyTotalGst)}</span>
					</div>
				</div>
			</div>

			<div class="overflow-hidden rounded-lg border shadow">
				<div class="p-6">
					<h2 class="text-center text-2xl font-bold tracking-tight">Yearly Summary</h2>
					<div class="my-4 border-t"></div>
					<div class="mb-3 flex items-center justify-between">
						<span class="text-base font-medium">{amountLabel}:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalAmount)}</span>
					</div>
					{@render yearlyExtra?.(yearlyTotalAmount)}
					<div class="flex items-center justify-between">
						<span class="text-base font-medium">Total GST:</span>
						<span class="text-xl font-bold">{formatCurrency(yearlyTotalGst)}</span>
					</div>
				</div>
			</div>
		</div>
	{/snippet}
</MonthlyTablePageShell>

<TransactionModal bind:open={openModal} categories={categories()} transactionForm={form!} />
