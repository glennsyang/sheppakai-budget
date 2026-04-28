<script lang="ts">
	import { Pencil, Trash2 } from '@lucide/svelte';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import { setContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent } from '$lib/components/ui/card';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import WindowCleaningCustomerModal from '$lib/components/WindowCleaningCustomerModal.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import type {
		windowCleaningCustomerSchema,
		windowCleaningJobSchema
	} from '$lib/formSchemas/windowCleaning';
	import { formatLocalTimestamp } from '$lib/utils/dates';

	import { columns } from './columns';

	import type { WindowCleaningCustomerWithStats, WindowCleaningJob } from '$lib';

	interface Props {
		data: {
			customers: WindowCleaningCustomerWithStats[];
			totalCustomers: number;
			jobsThisMonthCount: number;
			earnedThisMonth: number;
			earnedThisYear: number;
			customerForm: SuperValidated<z.infer<typeof windowCleaningCustomerSchema>>;
			jobForm: SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
		};
	}

	let { data }: Props = $props();

	// svelte-ignore state_referenced_locally
	setContext('customerForm', data.customerForm);
	// svelte-ignore state_referenced_locally
	setContext('jobForm', data.jobForm);
	setContext('openCustomerSheet', (customer: WindowCleaningCustomerWithStats) => {
		selectedCustomer = customer;
		openSheet = true;
	});

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
		if (!selectedCustomer) return [];
		const c = data.customers.find((c) => c.id === selectedCustomer!.id);
		return c ? [...c.jobs].sort((a, b) => b.jobDate.localeCompare(a.jobDate)) : [];
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
</script>

<svelte:head>
	<title>Window Cleaning</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Window Cleaning</h1>
			<p class="mt-1 text-muted-foreground">Manage your customers and track jobs</p>
		</div>
		<Button size="sm" onclick={() => (openAddCustomerModal = true)}>
			<PlusIcon class="mr-2 h-4 w-4" />
			Add Customer
		</Button>
	</div>

	<!-- Stats Row -->
	<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Customers</p>
				<p class="text-2xl font-bold">{data.totalCustomers}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Jobs This Month</p>
				<p class="text-2xl font-bold">{data.jobsThisMonthCount}</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Earned This Month</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">
					{currencyFormatter.format(data.earnedThisMonth)}
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="pt-6">
				<p class="text-sm text-muted-foreground">Earned This Year</p>
				<p class="text-2xl font-bold text-green-600 dark:text-green-400">
					{currencyFormatter.format(data.earnedThisYear)}
				</p>
			</CardContent>
		</Card>
	</div>

	<!-- Customers Table -->
	{#if data.customers.length > 0}
		<DataTable {columns} data={data.customers} defaultSorting={[{ id: 'name', desc: false }]} />
	{:else}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">
					No customers yet. Add your first customer to get started!
				</p>
				<Button class="mt-4" onclick={() => (openAddCustomerModal = true)}>
					<PlusIcon class="mr-2 h-4 w-4" />
					Add Your First Customer
				</Button>
			</CardContent>
		</Card>
	{/if}
</div>

<!-- Customer Detail Sheet -->
<Sheet.Root bind:open={openSheet}>
	<Sheet.Content side="right" class="flex w-full flex-col sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>{selectedCustomer?.name ?? 'Customer'}</Sheet.Title>
			<Sheet.Description>
				{#if selectedCustomer}
					{selectedCustomer.address}{selectedCustomer.unitNumber
						? `, Unit ${selectedCustomer.unitNumber}`
						: ''} — {selectedCustomer.city}
				{/if}
			</Sheet.Description>
		</Sheet.Header>

		{#if selectedCustomer}
			<div class="flex-1 overflow-y-auto px-4 py-3">
				<!-- Customer Info -->
				<div class="mb-4 space-y-1 text-sm">
					{#if selectedCustomer.buzzerNumber}
						<p class="text-muted-foreground">Buzzer: {selectedCustomer.buzzerNumber}</p>
					{/if}
					{#if selectedCustomer.phoneNumber}
						<p>
							<a href="tel:{selectedCustomer.phoneNumber}" class="text-primary hover:underline">
								📞 {selectedCustomer.phoneNumber}
							</a>
						</p>
					{/if}
					{#if selectedCustomer.notes}
						<p class="rounded-md bg-muted px-3 py-2 text-sm italic">
							{selectedCustomer.notes}
						</p>
					{/if}
				</div>

				<!-- Customer Stats -->
				<div class="mb-4 flex gap-4 rounded-md border p-3 text-sm">
					<div>
						<span class="text-muted-foreground">Total Earned:</span>
						<span class="ml-1 font-semibold text-green-600 dark:text-green-400">
							{currencyFormatter.format(selectedCustomer.totalEarned)}
						</span>
					</div>
					<div>
						<span class="text-muted-foreground">Visits:</span>
						<span class="ml-1 font-semibold">{selectedCustomer.jobs.length}</span>
					</div>
					{#if selectedCustomer.lastJobDate}
						<div>
							<span class="text-muted-foreground">Last Visit:</span>
							<span class="ml-1 font-semibold">
								{formatLocalTimestamp(selectedCustomer.lastJobDate)}
							</span>
						</div>
					{/if}
				</div>

				<!-- Sheet Actions -->
				<div class="mb-4 flex gap-2">
					<Button size="sm" onclick={handleLogJob}>
						<PlusIcon class="mr-1 h-4 w-4" />
						Log Job
					</Button>
					<Button size="sm" variant="outline" onclick={() => (openEditCustomerModal = true)}>
						Edit Customer
					</Button>
				</div>

				<!-- Jobs Table -->
				{#if selectedCustomerJobs.length === 0}
					<div
						class="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground"
					>
						No jobs logged for this customer yet.
					</div>
				{:else}
					<div class="rounded-md border">
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Date</Table.Head>
									<Table.Head>Time</Table.Head>
									<Table.Head>Duration</Table.Head>
									<Table.Head class="text-right">Charged</Table.Head>
									<Table.Head class="text-right">Tip</Table.Head>
									<Table.Head class="text-right">Total</Table.Head>
									<Table.Head>Note</Table.Head>
									<Table.Head class="w-16"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each selectedCustomerJobs as job (job.id)}
									<Table.Row>
										<Table.Cell class="text-sm">{formatLocalTimestamp(job.jobDate)}</Table.Cell>
										<Table.Cell class="text-sm">{job.jobTime ?? '—'}</Table.Cell>
										<Table.Cell class="text-sm">
											{job.durationHours != null ? `${job.durationHours}h` : '—'}
										</Table.Cell>
										<Table.Cell class="text-right text-sm">
											{currencyFormatter.format(job.amountCharged)}
										</Table.Cell>
										<Table.Cell class="text-right text-sm">
											{job.tip > 0 ? currencyFormatter.format(job.tip) : '—'}
										</Table.Cell>
										<Table.Cell class="text-right text-sm font-medium">
											{currencyFormatter.format(job.amountCharged + job.tip)}
										</Table.Cell>
										<Table.Cell class="max-w-32 truncate text-sm text-muted-foreground">
											{job.notes ?? ''}
										</Table.Cell>
										<Table.Cell>
											<div class="flex gap-1">
												<Button
													size="icon"
													variant="outline"
													class="h-7 w-7"
													aria-label="Edit Job"
													onclick={() => handleEditJob(job)}
												>
													<Pencil class="h-3.5 w-3.5" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													class="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
													aria-label="Delete Job"
													onclick={() => handleDeleteJob(job.id)}
												>
													<Trash2 class="h-3.5 w-3.5" />
												</Button>
											</div>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				{/if}
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
	title="Delete Job"
	message="Are you sure you want to delete this job? This cannot be undone."
	confirmButtonText="Delete"
/>
