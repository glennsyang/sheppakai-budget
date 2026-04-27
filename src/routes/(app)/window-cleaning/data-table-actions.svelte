<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import WindowCleaningCustomerModal from '$lib/components/WindowCleaningCustomerModal.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import type {
		windowCleaningCustomerSchema,
		windowCleaningJobSchema
	} from '$lib/formSchemas/windowCleaning';

	import type { WindowCleaningCustomer, WindowCleaningCustomerWithStats } from '$lib';

	let { customerData }: { customerData: WindowCleaningCustomerWithStats } = $props();

	let openEditModal = $state(false);
	let openDeleteModal = $state(false);
	let openLogJobModal = $state(false);

	const customerForm = getContext('customerForm') as SuperValidated<
		z.infer<typeof windowCleaningCustomerSchema>
	>;
	const jobForm = getContext('jobForm') as SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
	const openCustomerSheet = getContext('openCustomerSheet') as (
		customer: WindowCleaningCustomerWithStats
	) => void;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
				<span class="sr-only">Open menu</span>
				<EllipsisIcon />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item onclick={() => (openEditModal = true)}>Edit</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => (openLogJobModal = true)}>Log Job</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => openCustomerSheet(customerData)}>View Jobs</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			class="text-destructive focus:text-destructive"
			onclick={() => (openDeleteModal = true)}
		>
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

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
