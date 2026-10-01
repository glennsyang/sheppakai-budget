<script lang="ts">
	import type { WindowCleaningJob } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import type { windowCleaningJobSchema } from '$lib/formSchemas';
	import { getContext } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	let { jobData }: { jobData: WindowCleaningJob } = $props();

	let openEditModal = $state(false);
	let openDeleteModal = $state(false);

	const jobForm = getContext('jobForm') as SuperValidated<z.infer<typeof windowCleaningJobSchema>>;
</script>

<RowActionsMenu onEdit={() => (openEditModal = true)} onDelete={() => (openDeleteModal = true)} />

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
