<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';

	let isSubmitting = $state(false);
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<div class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 text-center shadow-lg">
		<div>
			<h1 class="text-3xl font-bold">Sign Out</h1>
			<p class="mt-2 text-gray-600">Are you sure you want to sign out?</p>
		</div>

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
					<Spinner class="mr-2" aria-hidden="true" />
					Signing Out...
				{:else}
					Sign Out
				{/if}
			</Button>
		</form>

		<div class="text-center">
			<a href="/dashboard" class="text-sm"> Cancel </a>
		</div>
	</div>
</div>
