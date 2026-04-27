<script lang="ts">
	import ArchiveRestoreIcon from '@lucide/svelte/icons/archive-restore';
	import { toast } from 'svelte-sonner';
	import { getContext } from 'svelte';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import type { restoreCustomerSchema } from '$lib/formSchemas/windowCleaning';

	import type { WindowCleaningCustomer } from '$lib';

	type DeletedCustomer = WindowCleaningCustomer & { user: { name: string; email: string } };

	let { customer }: { customer: DeletedCustomer } = $props();

	let openRestoreDialog = $state(false);

	const restoreForm = getContext('restoreForm') as SuperValidated<
		z.infer<typeof restoreCustomerSchema>
	>;

	const { form, enhance, message, submitting } = superForm(restoreForm, {
		resetForm: true,
		onUpdate: ({ form }) => {
			if (form.valid) {
				openRestoreDialog = false;
				toast.success('Customer restored successfully');
			}
			if ($message?.type === 'error') {
				toast.error(`Error: ${$message.text}`);
			}
		},
		onError: ({ result }) => {
			toast.error(`Failed to restore customer: ${result.error.message}`);
		}
	});

	$effect(() => {
		if (openRestoreDialog) {
			$form.customerId = customer.id;
		}
	});
</script>

<Button
	variant="ghost"
	size="sm"
	onclick={() => (openRestoreDialog = true)}
	class="flex items-center gap-2"
>
	<ArchiveRestoreIcon class="size-4" />
	Restore
</Button>

<Dialog.Root bind:open={openRestoreDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Restore Customer</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to restore "{customer.name}" ({customer.user.name ||
					customer.user.email})? They will reappear in the active customers list.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/admin/deleted-customers?/restore" use:enhance>
			<input type="hidden" name="customerId" bind:value={$form.customerId} />
			<div class="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onclick={() => (openRestoreDialog = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Restoring...' : 'Restore'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
