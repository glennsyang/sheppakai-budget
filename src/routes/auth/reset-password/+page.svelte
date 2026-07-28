<script lang="ts">
	import AuthCardLayout from '$lib/components/AuthCardLayout.svelte';
	import AuthFormField from '$lib/components/AuthFormField.svelte';
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, message, submitting, enhance } = superForm(data.form);
</script>

<AuthCardLayout title="Reset Password" description="Enter your new password">
	<form method="POST" class="space-y-4" use:enhance>
		<AuthFormMessage message={$message} />

		<input type="hidden" name="token" bind:value={data.token} />

		<AuthFormField
			id="password"
			label="New Password"
			type="password"
			placeholder="Enter new password (min 8 characters)"
			bind:value={$form.password}
			errors={$errors.password}
			autocomplete="new-password"
			required
		/>

		<AuthFormField
			id="confirmPassword"
			label="Confirm Password"
			type="password"
			placeholder="Confirm new password"
			bind:value={$form.confirmPassword}
			errors={$errors.confirmPassword}
			autocomplete="new-password"
			required
		/>

		<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
			{#if $submitting}
				<Spinner class="mr-2" aria-hidden="true" />
				Resetting...
			{:else}
				Reset Password
			{/if}
		</Button>
	</form>

	{#snippet footer()}
		<p class="text-sm">
			<a href="/auth/sign-in" class="font-medium underline"> Back to sign in </a>
		</p>
	{/snippet}
</AuthCardLayout>
