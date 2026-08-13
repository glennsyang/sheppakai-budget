<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { revokeApiKeyFormContext } from '$lib/contexts';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

	import type { AdminApiKey } from './columns';

	let { apiKey }: { apiKey: AdminApiKey } = $props();

	let openRevokeDialog = $state(false);

	const revokeForm = revokeApiKeyFormContext.get();

	const { form, enhance, submitting } = superForm(revokeForm, {
		resetForm: true,
		onUpdate: ({ form }) => {
			// Read form.message, not $message: superforms clears the store on submit and only
			// repopulates it after onUpdate has run, so the store is always undefined here.
			if (form.message?.type === 'success') {
				openRevokeDialog = false;
				toast.success(form.message.text);
			} else if (form.message?.type === 'error') {
				toast.error(form.message.text);
			}
		},
		onError: ({ result }) => {
			toast.error(`Failed to revoke API key: ${result.error.message}`);
		}
	});

	$effect(() => {
		if (openRevokeDialog) {
			$form.id = apiKey.id;
		}
	});
</script>

<Button
	variant="ghost"
	size="sm"
	onclick={() => (openRevokeDialog = true)}
	class="text-destructive flex items-center gap-2"
>
	<TrashIcon class="size-4" />
	Revoke
</Button>

<Dialog.Root bind:open={openRevokeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Revoke API Key</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to revoke "{apiKey.name || '(unnamed)'}"? Any tool using this key will
				immediately lose access, and this cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="/admin/api-keys?/revoke" use:enhance>
			<input type="hidden" name="id" bind:value={$form.id} />
			<div class="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onclick={() => (openRevokeDialog = false)}>
					Cancel
				</Button>
				<Button type="submit" variant="destructive" disabled={$submitting}>
					{$submitting ? 'Revoking...' : 'Revoke'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
