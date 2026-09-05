<script lang="ts">
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Field, FieldDescription, FieldGroup, FieldLabel } from '$lib/components/ui/field';
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
		<Card.Title class="text-2xl">Sign In</Card.Title>
		<Card.Description>Enter your credentials to access your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<FieldGroup>
				<AuthFormMessage message={$message} />

				<Field>
					<FieldLabel for="email">Email</FieldLabel>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="Enter your email"
						bind:value={$form.email}
						class={$errors.email ? 'border-red-500' : ''}
						autocomplete="email"
						required
					/>
					{#if $errors.email}
						<p class="text-sm text-red-600 dark:text-red-400">{$errors.email}</p>
					{/if}
				</Field>

				<Field>
					<div class="flex items-center">
						<FieldLabel for="password">Password</FieldLabel>
						<a href="/auth/forgot-password" class="ms-auto text-sm font-medium underline">
							Forgot password?
						</a>
					</div>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Enter your password"
						bind:value={$form.password}
						class={$errors.password ? 'border-red-500' : ''}
						autocomplete="current-password"
						required
					/>
					{#if $errors.password}
						<p class="text-sm text-red-600 dark:text-red-400">{$errors.password}</p>
					{/if}
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
						{#if $submitting}
							<Spinner class="mr-2" aria-hidden="true" />
							Signing In...
						{:else}
							Sign In
						{/if}
					</Button>
					<FieldDescription class="text-center">
						Don't have an account? <a href="/auth/register" class="font-medium underline"
							>Register here</a
						>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
