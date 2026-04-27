<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import type { windowCleaningJobSchema } from '$lib/formSchemas/windowCleaning';

	import type { WindowCleaningJob } from '$lib';

	let { jobData }: { jobData: WindowCleaningJob } = $props();

	let openEditModal = $state(false);
	let openDeleteModal = $state(false);

	const jobForm = getContext('jobForm') as SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
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
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			class="text-destructive focus:text-destructive"
			onclick={() => (openDeleteModal = true)}
		>
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<WindowCleaningJobModal
	bind:open={openEditModal}
	initialData={jobData}
	isEditing
	{jobForm}
	preselectedCustomerId={jobData.customerId}
/>

<ConfirmModal
	bind:open={openDeleteModal}
	id={jobData.id}
	actionUrl="/window-cleaning/jobs?/deleteJob"
	title="Delete Job"
	message="Are you sure you want to delete this job? This cannot be undone."
	confirmButtonText="Delete"
/>
