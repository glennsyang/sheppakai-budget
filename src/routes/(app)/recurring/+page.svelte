<script lang="ts">
	import type { Recurring } from '$lib';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import RecurringModal from '$lib/components/RecurringModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { recurringFormContext } from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	recurringFormContext.set(data.form);

	let openModal = $state<boolean>(false);
	const unpaidAsOf = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric'
	}).format(new Date());

	// Paid bills recede so what is still owed stands out.
	const getRecurringRowClass = (recurring: Recurring) =>
		recurring.paid ? 'text-muted-foreground' : '';

	let totalRecurring = $derived(data.recurrings.reduce((sum, item) => sum + item.amount, 0));
	let totalUnpaidRecurring = $derived(
		data.recurrings.filter((item) => !item.paid).reduce((sum, item) => sum + item.amount, 0)
	);
	let paidCount = $derived(data.recurrings.filter((item) => item.paid).length);

	let stats = $derived<Stat[]>([
		{ label: 'Recurring total', value: formatCurrency(totalRecurring) },
		{
			label: 'Left to pay',
			value: formatCurrency(totalUnpaidRecurring),
			subtext: `Unpaid as of ${unpaidAsOf}`
		},
		{
			label: 'Paid',
			value: `${paidCount} of ${data.recurrings.length}`,
			meter: data.recurrings.length > 0 ? (paidCount / data.recurrings.length) * 100 : 0
		}
	]);
</script>

<svelte:head>
	<title>Recurring</title>
</svelte:head>

<PageShell
	title="Recurring"
	subtitle="Bills and subscriptions that come around every month or year"
>
	{#snippet actions()}
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			Add recurring
		</Button>
	{/snippet}

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		<DashboardStatStrip {stats} />
		<DataTable
			{columns}
			data={data.recurrings}
			defaultPageSize={20}
			rowClassName={getRecurringRowClass}
			searchPlaceholder="Search bills…"
			emptyMessage="No recurring bills yet. Add rent, subscriptions or insurance to see what is still owed each month."
		/>
	{/if}
</PageShell>

<RecurringModal bind:open={openModal} recurringForm={data.form} />
