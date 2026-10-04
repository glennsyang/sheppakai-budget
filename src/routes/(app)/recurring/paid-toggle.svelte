<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { Recurring } from '$lib';
	import { actionMessage } from '$lib/utils/actionMessage';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { toast } from 'svelte-sonner';

	let { recurring }: { recurring: Recurring } = $props();

	let pending = $state(false);
	// Optimistic: flip straight away, settle to the server's value once it answers.
	let optimisticPaid = $state<boolean | null>(null);
	let paid = $derived(optimisticPaid ?? recurring.paid);
</script>

<form
	method="POST"
	action="?/togglePaid"
	use:enhance={() => {
		pending = true;
		optimisticPaid = !recurring.paid;
		return async ({ result, update }) => {
			if (result.type === 'success') {
				// Silent on success — a toast on every tick would be noise.
				await invalidateAll();
			} else {
				const { text } = actionMessage(result, {
					success: 'Paid status updated',
					error: 'Failed to toggle paid status'
				});
				toast.error(text);
			}
			await update();
			optimisticPaid = null;
			pending = false;
		};
	}}
>
	<input type="hidden" name="id" value={recurring.id} />
	<input type="hidden" name="paid" value={recurring.paid ? 'false' : 'true'} />
	<button
		type="submit"
		disabled={pending}
		aria-pressed={paid}
		aria-label="{paid ? 'Mark unpaid' : 'Mark paid'}: {recurring.merchant}"
		class="group focus-visible:ring-ring/50 flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-[3px] md:size-8"
	>
		<span
			class={[
				'flex size-5 items-center justify-center rounded-full border transition-colors',
				paid
					? 'bg-primary border-primary text-primary-foreground'
					: 'border-input group-hover:border-foreground/40 bg-transparent text-transparent'
			]}
		>
			<CheckIcon class="size-3" strokeWidth={3} />
		</span>
	</button>
</form>
