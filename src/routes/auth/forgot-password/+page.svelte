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

<AuthCardLayout
	title="Forgot Password"
	description="Enter your email to receive a password reset link"
>
	<form method="POST" class="space-y-4" use:enhance>
		<AuthFormMessage message={$message} />

		<AuthFormField
			id="email"
			label="Email"
			type="email"
			placeholder="Enter your email"
			bind:value={$form.email}
			errors={$errors.email}
			autocomplete="email"
			required
		/>

		<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
			{#if $submitting}
				<Spinner class="mr-2" aria-hidden="true" />
				Sending...
			{:else}
				Send Reset Link
			{/if}
		</Button>
	</form>

	{#snippet footer()}
		<p class="text-sm">
			Remember your password?
			<a href="/auth/sign-in" class="font-medium underline"> Sign in here </a>
		</p>
	{/snippet}
</AuthCardLayout>
