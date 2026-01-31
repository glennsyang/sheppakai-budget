<script lang="ts">
	import ArchiveRestoreIcon from '@lucide/svelte/icons/archive-restore';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { unArchiveFormContext } from '$lib/contexts';
	import type { unArchiveSchema } from '$lib/formSchemas';

	import type { SavingsGoal } from '$lib';

	let { goal }: { goal: SavingsGoal } = $props();

	let openUnarchiveDialog = $state<boolean>(false);
	let isSubmitting = $state<boolean>(false);

	const unArchiveForm = unArchiveFormContext.get() as SuperValidated<
		z.infer<typeof unArchiveSchema>
	>;

	const { form, enhance, message } = superForm(unArchiveForm, {
		resetForm: true,
		onUpdate: async ({ form }) => {
			if (form.valid) {
				openUnarchiveDialog = false;
				toast.success('Goal unarchived successfully');
			}
			if ($message?.type === 'error') {
				toast.error(`Error: ${$message.text}`);
			}
		},
		onError: ({ result }) => {
			toast.error(`Failed to unarchive goal: ${result.error.message}`);
		}
	});

	$effect(() => {
		if (openUnarchiveDialog) {
			$form.goalId = goal.id;
		}
	});
</script>

<Button
	variant="ghost"
	size="sm"
	onclick={() => (openUnarchiveDialog = true)}
	class="flex items-center gap-2"
>
	<ArchiveRestoreIcon class="size-4" />
	Unarchive
</Button>

<!-- Unarchive Confirmation Dialog -->
<Dialog.Root bind:open={openUnarchiveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Unarchive Savings Goal</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to unarchive "{goal.name}" for {goal.user.name || goal.user.email}?
				The goal will be set to active status.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/admin/archived-goals?/unarchive" use:enhance>
			<input type="hidden" name="goalId" bind:value={$form.goalId} />

			<div class="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onclick={() => (openUnarchiveDialog = false)}
					>Cancel</Button
				>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Unarchiving...' : 'Unarchive'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
