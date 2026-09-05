<script lang="ts">
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, message, submitting, enhance } = superForm(data.form);
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	<Card.Header class="text-center">
		<Card.Title class="text-2xl">Reset Password</Card.Title>
		<Card.Description>Enter your new password</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<FieldGroup>
				<AuthFormMessage message={$message} />

				<input type="hidden" name="token" bind:value={data.token} />

				<Field>
					<FieldLabel for="password">New Password</FieldLabel>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Enter new password (min 8 characters)"
						bind:value={$form.password}
						class={$errors.password ? 'border-red-500' : ''}
						autocomplete="new-password"
						required
					/>
					{#if $errors.password}
						<p class="text-sm text-red-600 dark:text-red-400">{$errors.password}</p>
					{/if}
				</Field>

				<Field>
					<FieldLabel for="confirmPassword">Confirm Password</FieldLabel>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						placeholder="Confirm new password"
						bind:value={$form.confirmPassword}
						class={$errors.confirmPassword ? 'border-red-500' : ''}
						autocomplete="new-password"
						required
					/>
					{#if $errors.confirmPassword}
						<p class="text-sm text-red-600 dark:text-red-400">{$errors.confirmPassword}</p>
					{/if}
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
						{#if $submitting}
							<Spinner class="mr-2" aria-hidden="true" />
							Resetting...
						{:else}
							Reset Password
						{/if}
					</Button>
				</Field>

				<Field>
					<a href="/auth/sign-in" class="text-center text-sm font-medium underline">
						Back to sign in
					</a>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
