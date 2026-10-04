<script lang="ts">
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import SavingsModal from '$lib/components/SavingsModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { DataTable } from '$lib/components/ui/data-table';
	import { savingsFormContext } from '$lib/contexts';
	import { formatCurrency } from '$lib/utils';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	if (data.form) {
		savingsFormContext.set(data.form);
	}

	let openModal = $state<boolean>(false);

	let totalSavings = $derived(data.savings.reduce((sum, saving) => sum + saving.amount, 0));
	let largest = $derived(
		data.savings.reduce<(typeof data.savings)[number] | null>(
			(top, s) => (!top || s.amount > top.amount ? s : top),
			null
		)
	);

	let stats = $derived<Stat[]>([
		{
			label: 'Total savings',
			value: formatCurrency(totalSavings),
			subtext: `${data.savings.length} ${data.savings.length === 1 ? 'account' : 'accounts'}`
		},
		{
			label: 'Largest account',
			value: largest ? formatCurrency(largest.amount) : '—',
			subtext: largest?.title
		}
	]);
</script>

<svelte:head>
	<title>Savings</title>
</svelte:head>

<PageShell title="Savings" subtitle="What is set aside in each account">
	{#snippet actions()}
		<Button href="/savings/goals" variant="outline">Goals</Button>
		<Button onclick={() => (openModal = true)}>
			<PlusIcon />
			Add account
		</Button>
	{/snippet}

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		<DashboardStatStrip {stats} />
		<DataTable
			{columns}
			data={data.savings}
			searchable={data.savings.length > 10}
			defaultSorting={[{ id: 'amount', desc: true }]}
			emptyMessage="No savings accounts yet. Add one to track its balance here."
		/>
	{/if}
</PageShell>

<SavingsModal bind:open={openModal} savingsForm={data.form} />
