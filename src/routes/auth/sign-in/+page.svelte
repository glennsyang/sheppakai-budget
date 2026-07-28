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

<AuthCardLayout title="Sign In" description="Enter your credentials to access your account">
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

		<AuthFormField
			id="password"
			label="Password"
			type="password"
			placeholder="Enter your password"
			bind:value={$form.password}
			errors={$errors.password}
			autocomplete="current-password"
			required
		/>

		<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
			{#if $submitting}
				<Spinner class="mr-2" aria-hidden="true" />
				Signing In...
			{:else}
				Sign In
			{/if}
		</Button>
	</form>

	{#snippet footer()}
		<p class="text-sm">
			<a href="/auth/forgot-password" class="font-medium underline"> Forgot password? </a>
		</p>
		<p class="text-sm">
			Don't have an account?
			<a href="/auth/register" class="font-medium underline"> Register here </a>
		</p>
	{/snippet}
</AuthCardLayout>
