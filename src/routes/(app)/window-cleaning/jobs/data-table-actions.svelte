<script lang="ts">
	import type { WindowCleaningJob } from '$lib';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import RowActionsMenu from '$lib/components/RowActionsMenu.svelte';
	import WindowCleaningJobModal from '$lib/components/WindowCleaningJobModal.svelte';
	import { jobFormContext } from '$lib/contexts';

	let { jobData }: { jobData: WindowCleaningJob } = $props();

	let openEditModal = $state(false);
	let openDeleteModal = $state(false);

	const jobForm = jobFormContext.get();
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
