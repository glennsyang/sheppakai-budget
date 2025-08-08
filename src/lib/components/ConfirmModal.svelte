<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		open: boolean;
		title: string;
		message: string;
		onOpenChange: (open: boolean) => void;
		onConfirm?: () => void;
	}

	let { open = $bindable(), title, message, onOpenChange, onConfirm }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			<Dialog.Description>
				{message}
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Dialog.Close><Button type="button" variant="outline">Close</Button></Dialog.Close>
			<Button type="button" onclick={onConfirm}>Ok</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
