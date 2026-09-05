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
		<Card.Title class="text-2xl">Register</Card.Title>
		<Card.Description>Create your account to get started</Card.Description>
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
					<FieldLabel for="name">Name</FieldLabel>
					<Input
						id="name"
						name="name"
						type="text"
						placeholder="Enter your name"
						bind:value={$form.name}
						class={$errors.name ? 'border-red-500' : ''}
						autocomplete="given-name"
					/>
					{#if $errors.name}
						<p class="text-sm text-red-600 dark:text-red-400">{$errors.name}</p>
					{/if}
				</Field>

				<Field>
					<FieldLabel for="password">Password</FieldLabel>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Create a password"
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
						placeholder="Confirm your password"
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
							Creating Account...
						{:else}
							Register
						{/if}
					</Button>
					<FieldDescription class="text-center">
						Already have an account? <a href="/auth/sign-in" class="font-medium underline"
							>Sign in here</a
						>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
