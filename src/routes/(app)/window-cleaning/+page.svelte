<script lang="ts">
	import type { WindowCleaningCustomerWithStats, WindowCleaningJob } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import DashboardStatStrip, { type Stat } from '$lib/components/DashboardStatStrip.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import WindowCleaningCustomerModal from '$lib/components/WindowCleaningCustomerModal.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import { customerFormContext, jobFormContext, openCustomerSheetContext } from '$lib/contexts';
	import { formatLocalTimestamp, formatTime12h } from '$lib/utils/dates';
	import { buildGoogleMapsUrl } from '$lib/utils/maps';
	import MailIcon from '@lucide/svelte/icons/mail';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import PhoneIcon from '@lucide/svelte/icons/phone';
	import PlusIcon from '@lucide/svelte/icons/plus';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	customerFormContext.set(data.customerForm);
	// svelte-ignore state_referenced_locally
	jobFormContext.set(data.jobForm);
	function openCustomerSheet(customer: WindowCleaningCustomerWithStats) {
		selectedCustomer = customer;
		openSheet = true;
	}
	openCustomerSheetContext.set(openCustomerSheet);

	let openAddCustomerModal = $state(false);
	let openEditCustomerModal = $state(false);
	let openLogJobModal = $state(false);
	let openEditJobModal = $state(false);
	let openSheet = $state(false);

	let selectedCustomer = $state<WindowCleaningCustomerWithStats | null>(null);
	let editingJob = $state<WindowCleaningJob | null>(null);
	let deletingJobId = $state('');
	let openDeleteJobModal = $state(false);

	const currencyFormatter = new Intl.NumberFormat('en-CA', {
		style: 'currency',
		currency: 'CAD'
	});

	let selectedCustomerJobs = $derived.by(() => {
		const selected = selectedCustomer;
		if (!selected) return [];
		const customer = data.customers.find((c) => c.id === selected.id);
		return customer
			? [...customer.jobs].toSorted((a, b) => b.jobDate.localeCompare(a.jobDate))
			: [];
	});

	function handleLogJob() {
		editingJob = null;
		openLogJobModal = true;
	}

	function handleEditJob(job: WindowCleaningJob) {
		editingJob = job;
		openEditJobModal = true;
	}

	function handleDeleteJob(jobId: string) {
		deletingJobId = jobId;
		openDeleteJobModal = true;
	}

	const thisYear = new Date().getFullYear();

	let stats = $derived.by<Stat[]>(() => {
		const diff = data.earnedThisYear - data.earnedLastYear;
		const pct =
			data.earnedLastYear > 0 ? Math.round(Math.abs(diff / data.earnedLastYear) * 100) : 0;
		return [
			{ label: 'Customers', value: String(data.totalCustomers) },
			{ label: 'Jobs this month', value: String(data.jobsThisMonthCount) },
			{ label: 'Earned this month', value: currencyFormatter.format(data.earnedThisMonth) },
			{
				label: `Earned in ${thisYear}`,
				value: currencyFormatter.format(data.earnedThisYear),
				trend:
					data.earnedLastYear > 0
						? {
								direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat',
								label: `${pct}% ${diff >= 0 ? 'ahead of' : 'behind'} ${thisYear - 1} (${currencyFormatter.format(data.earnedLastYear)})`
							}
						: undefined
			}
		];
	});
</script>

<svelte:head>
	<title>Window cleaning</title>
</svelte:head>

<PageShell title="Window cleaning" subtitle="Customers, visits and what each one has earned">
	{#snippet actions()}
		<Button href="/window-cleaning/jobs" variant="outline">All jobs</Button>
		<Button onclick={() => (openAddCustomerModal = true)}>
			<PlusIcon />
			Add customer
		</Button>
	{/snippet}

	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{:else}
		<DashboardStatStrip {stats} />

		{#if data.customers.length > 0}
			<DataTable
				{columns}
				data={data.customers}
				defaultPageSize={20}
				defaultSorting={[{ id: 'name', desc: false }]}
				searchPlaceholder="Search customers or addresses…"
				onRowClick={openCustomerSheet}
				rowLabel={(c) => `Open ${c.name}`}
			/>
		{:else}
			<section class="bg-card rounded-xl border px-6 py-12 text-center shadow-sm">
				<h2 class="text-base font-semibold tracking-tight">No customers yet</h2>
				<p class="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
					Add a customer with their address, then log each visit to track what they have paid.
				</p>
				<Button class="mt-5" onclick={() => (openAddCustomerModal = true)}>
					<PlusIcon />
					Add your first customer
				</Button>
			</section>
		{/if}
	{/if}
</PageShell>

<!-- Customer Detail Sheet -->
<Sheet.Root bind:open={openSheet}>
	<Sheet.Content side="right" class="flex w-full flex-col gap-0 sm:max-w-xl">
		<Sheet.Header class="border-b pe-12">
			<Sheet.Title class="text-xl tracking-tight"
				>{selectedCustomer?.name ?? 'Customer'}</Sheet.Title
			>
			<Sheet.Description>
				{#if selectedCustomer}
					{selectedCustomer.address}{selectedCustomer.unitNumber
						? `, Unit ${selectedCustomer.unitNumber}`
						: ''}, {selectedCustomer.city}
				{/if}
			</Sheet.Description>
		</Sheet.Header>

		{#if selectedCustomer}
			<div class="flex-1 overflow-y-auto">
				<div class="flex flex-col gap-4 p-4">
					<!-- Field actions: big targets for use on the doorstep -->
					<div class="grid grid-cols-3 gap-2">
						<Button
							variant="outline"
							class="h-14 flex-col gap-1 text-xs"
							href={buildGoogleMapsUrl(
								selectedCustomer.address,
								selectedCustomer.city,
								selectedCustomer.unitNumber
							)}
							target="_blank"
							rel="noopener noreferrer"
						>
							<MapPinIcon class="size-4" />
							Directions
						</Button>
						<Button
							variant="outline"
							class="h-14 flex-col gap-1 text-xs"
							href={selectedCustomer.phoneNumber
								? `tel:${selectedCustomer.phoneNumber}`
								: undefined}
							disabled={!selectedCustomer.phoneNumber}
						>
							<PhoneIcon class="size-4" />
							Call
						</Button>
						<Button
							variant="outline"
							class="h-14 flex-col gap-1 text-xs"
							href={selectedCustomer.email ? `mailto:${selectedCustomer.email}` : undefined}
							disabled={!selectedCustomer.email}
						>
							<MailIcon class="size-4" />
							Email
						</Button>
					</div>

					{#if selectedCustomer.buzzerNumber || selectedCustomer.phoneNumber || selectedCustomer.email}
						<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
							{#if selectedCustomer.buzzerNumber}
								<dt class="text-muted-foreground">Buzzer</dt>
								<dd class="tabular-nums">{selectedCustomer.buzzerNumber}</dd>
							{/if}
							{#if selectedCustomer.phoneNumber}
								<dt class="text-muted-foreground">Phone</dt>
								<dd class="tabular-nums">{selectedCustomer.phoneNumber}</dd>
							{/if}
							{#if selectedCustomer.email}
								<dt class="text-muted-foreground">Email</dt>
								<dd class="truncate">{selectedCustomer.email}</dd>
							{/if}
						</dl>
					{/if}

					{#if selectedCustomer.notes}
						<p class="bg-muted/60 rounded-[10px] px-3 py-2.5 text-sm">{selectedCustomer.notes}</p>
					{/if}

					<dl class="bg-border grid grid-cols-3 gap-px overflow-hidden rounded-xl border">
						<div class="bg-card p-3">
							<dt class="text-muted-foreground text-xs">Total earned</dt>
							<dd class="mt-0.5 font-semibold tabular-nums">
								{currencyFormatter.format(selectedCustomer.totalEarned)}
							</dd>
						</div>
						<div class="bg-card p-3">
							<dt class="text-muted-foreground text-xs">Visits</dt>
							<dd class="mt-0.5 font-semibold tabular-nums">{selectedCustomer.jobs.length}</dd>
						</div>
						<div class="bg-card p-3">
							<dt class="text-muted-foreground text-xs">Last visit</dt>
							<dd class="mt-0.5 font-semibold tabular-nums">
								{selectedCustomer.lastJobDate
									? formatLocalTimestamp(selectedCustomer.lastJobDate)
									: '—'}
							</dd>
						</div>
					</dl>

					<div class="flex gap-2">
						<Button class="flex-1 sm:flex-none" onclick={handleLogJob}>
							<PlusIcon />
							Log job
						</Button>
						<Button variant="outline" onclick={() => (openEditCustomerModal = true)}>
							Edit customer
						</Button>
					</div>
				</div>

				<section class="border-t">
					<h3 class="text-muted-foreground px-4 pt-4 pb-2 text-xs font-medium">Visits</h3>
					{#if selectedCustomerJobs.length === 0}
						<p class="text-muted-foreground px-4 pb-8 text-sm">
							No jobs logged for this customer yet.
						</p>
					{:else}
						<ul class="divide-y border-t">
							{#each selectedCustomerJobs as job (job.id)}
								<li class="flex min-h-14 items-center gap-3 py-2.5 ps-4 pe-2">
									<div class="min-w-0 flex-1">
										<p class="text-sm font-medium">{formatLocalTimestamp(job.jobDate)}</p>
										<p class="text-muted-foreground truncate text-xs">
											{[
												formatTime12h(job.jobTime),
												job.durationHours != null ? `${job.durationHours}h` : null,
												job.notes
											]
												.filter(Boolean)
												.join(' · ') || 'No details'}
										</p>
									</div>
									<div class="shrink-0 text-right">
										<p class="text-sm font-medium tabular-nums">
											{currencyFormatter.format(job.amountCharged + job.tip)}
										</p>
										{#if job.tip > 0}
											<p class="text-muted-foreground text-xs tabular-nums">
												incl. {currencyFormatter.format(job.tip)} tip
											</p>
										{/if}
									</div>
									<RowActionsMenu
										onEdit={() => handleEditJob(job)}
										onDelete={() => handleDeleteJob(job.id)}
									/>
								</li>
							{/each}
						</ul>
					{/if}
				</section>
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>

<!-- Add Customer Modal -->
<WindowCleaningCustomerModal bind:open={openAddCustomerModal} customerForm={data.customerForm} />

<!-- Edit Customer Modal (opened from sheet) -->
<WindowCleaningCustomerModal
	bind:open={openEditCustomerModal}
	initialData={selectedCustomer ?? undefined}
	isEditing
	customerForm={data.customerForm}
/>

<!-- Log Job Modal -->
<WindowCleaningJobModal
	bind:open={openLogJobModal}
	jobForm={data.jobForm}
	preselectedCustomerId={selectedCustomer?.id}
/>

<!-- Edit Job Modal -->
<WindowCleaningJobModal
	bind:open={openEditJobModal}
	initialData={editingJob ?? undefined}
	isEditing
	jobForm={data.jobForm}
	preselectedCustomerId={selectedCustomer?.id}
/>

<!-- Delete Job Confirm -->
<ConfirmModal
	bind:open={openDeleteJobModal}
	id={deletingJobId}
	actionUrl="/window-cleaning?/deleteJob"
	title="Delete job"
	message="Are you sure you want to delete this job? This cannot be undone."
	confirmButtonText="Delete"
/>
