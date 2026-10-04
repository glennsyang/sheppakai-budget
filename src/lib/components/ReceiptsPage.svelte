<script lang="ts">
	import type { Transaction } from '$lib';
	import type { Stat } from '$lib/components/DashboardStatStrip.svelte';
	import MonthlyTablePageShell from '$lib/components/MonthlyTablePageShell.svelte';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { getCategoriesContext, transactionFormContext } from '$lib/contexts';
	import type { transactionSchema } from '$lib/formSchemas';
	import { formatCurrency, monthNames } from '$lib/utils';
	import { formatDayHeading } from '$lib/utils/dates';
	import { useMonthYearParams } from '$lib/utils/monthYearParams.svelte';
	import type { createReceiptColumns } from '$lib/utils/receipt-columns';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	interface Props {
		title: string;
		subtitle: string;
		basePath: string;
		columns: ReturnType<typeof createReceiptColumns>;
		/** What the amount totals are called, e.g. "Fuel" or "Spent". */
		amountLabel: string;
		/** Label for the add button, e.g. "Add fuel receipt". */
		addLabel: string;
		monthlyTransactions: Transaction[];
		yearlyTransactions: Transaction[];
		form?: SuperValidated<z.infer<typeof transactionSchema>>;
		loadError?: string;
		/** Extra figures for the stat strip, placed after the yearly total. */
		yearlyExtra?: (yearlyTotalAmount: number) => Stat[];
	}

	let {
		title,
		subtitle,
		basePath,
		columns,
		amountLabel,
		addLabel,
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

	let monthName = $derived(monthNames[monthYear.month - 1]);

	let stats = $derived<Stat[]>([
		{
			label: `${amountLabel} in ${monthName}`,
			value: formatCurrency(monthlyTotalAmount),
			subtext: `GST ${formatCurrency(monthlyTotalGst)}`
		},
		{
			label: `${amountLabel} in ${monthYear.year}`,
			value: formatCurrency(yearlyTotalAmount)
		},
		...(yearlyExtra?.(yearlyTotalAmount) ?? []),
		{
			label: `GST paid in ${monthYear.year}`,
			value: formatCurrency(yearlyTotalGst),
			tooltip: 'Input tax credits you can claim, from the GST on these receipts.'
		}
	]);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<MonthlyTablePageShell
	{title}
	{subtitle}
	{loadError}
	selectedMonth={monthYear.month}
	selectedYear={monthYear.year}
	onMonthYearChange={monthYear.onMonthYearChange}
	{stats}
	skeletonColumns={columns.length - 1}
>
	{#snippet primaryAction()}
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			{addLabel}
		</Button>
	{/snippet}

	{#snippet tableContent()}
		<DataTable
			{columns}
			data={monthlyTransactions}
			mobileGroupBy={(t) => formatDayHeading(t.date)}
			emptyMessage={`No receipts for ${monthName} ${monthYear.year} yet.`}
		/>
	{/snippet}
</MonthlyTablePageShell>

<TransactionModal bind:open={openModal} categories={categories()} transactionForm={form!} />
