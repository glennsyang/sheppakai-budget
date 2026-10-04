<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Spinner } from '$lib/components/ui/spinner';

	let isSubmitting = $state(false);
</script>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="text-xl tracking-tight">Sign out?</Card.Title>
		<Card.Description>You'll need your email and password to get back in.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;

				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<Button type="submit" class="w-full" disabled={isSubmitting} aria-busy={isSubmitting}>
				{#if isSubmitting}
					<Spinner aria-hidden="true" />
					Signing out…
				{:else}
					Sign out
				{/if}
			</Button>
		</form>
		<Button href="/dashboard" variant="ghost" class="w-full">Cancel</Button>
	</Card.Content>
</Card.Root>
