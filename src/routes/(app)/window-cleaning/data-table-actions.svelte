<script lang="ts">
	import type { WindowCleaningCustomer, WindowCleaningCustomerWithStats } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import WindowCleaningCustomerModal from '$lib/components/WindowCleaningCustomerModal.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import { customerFormContext, jobFormContext, openCustomerSheetContext } from '$lib/contexts';

	let { customerData }: { customerData: WindowCleaningCustomerWithStats } = $props();

	let openEditModal = $state(false);
	let openDeleteModal = $state(false);
	let openLogJobModal = $state(false);

	const customerForm = customerFormContext.get();
	const jobForm = jobFormContext.get();
	const openCustomerSheet = openCustomerSheetContext.get();
</script>

<RowActionsMenu
	onEdit={() => (openEditModal = true)}
	onDelete={() => (openDeleteModal = true)}
	stopTriggerPropagation
>
	<DropdownMenu.Item onclick={() => (openLogJobModal = true)}>Log Job</DropdownMenu.Item>
	<DropdownMenu.Item onclick={() => openCustomerSheet(customerData)}>View Jobs</DropdownMenu.Item>
</RowActionsMenu>

<WindowCleaningCustomerModal
	bind:open={openEditModal}
	initialData={customerData as Partial<WindowCleaningCustomer>}
	isEditing
	{customerForm}
/>

<WindowCleaningJobModal
	bind:open={openLogJobModal}
	{jobForm}
	preselectedCustomerId={customerData.id}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	id={customerData.id}
	actionUrl="/window-cleaning?/deleteCustomer"
	title="Delete Customer"
	message="Are you sure you want to delete {customerData.name}? They will be moved to the deleted customers list and can be restored from the Admin panel."
	confirmButtonText="Delete"
/>
