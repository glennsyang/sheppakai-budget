<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { actionMessage } from '$lib/utils/actionMessage';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		confirmButtonText: string;
		id?: string;
		actionUrl?: string;
	}

	let { open = $bindable(), title, message, id, confirmButtonText, actionUrl }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{message}
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action={actionUrl}
			use:enhance={() => {
				open = false;

				return async ({ result, update }) => {
					const { type, text } = actionMessage(result, {
						success: `${title} successful!`,
						error: `${title} failed!`
					});

					toast[type](text);

					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />
			<input type="hidden" name="status" value="archived" />
			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit">{confirmButtonText}</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
