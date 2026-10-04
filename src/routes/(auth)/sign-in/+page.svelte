<script lang="ts">
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import FormMessage from '$lib/components/FormMessage.svelte';
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

<svelte:head>
	<title>Sign in · Sheppakai Budget</title>
</svelte:head>

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="text-xl tracking-tight">Sign in</Card.Title>
		<Card.Description>Welcome back.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form method="POST" use:enhance>
			<FieldGroup>
				{#if data.resetComplete}
					<FormMessage type="success" text="Password changed. Sign in with your new password." />
				{/if}

				{#if data.invalidVerificationLink}
					<FormMessage
						type="error"
						text="That verification link is invalid or has expired. Sign in to get a new one."
					/>
				{/if}

				<AuthFormMessage message={$message} />

				<Field>
					<FieldLabel for="email">Email</FieldLabel>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="you@example.com"
						bind:value={$form.email}
						class={$errors.email ? 'border-destructive' : ''}
						autocomplete="email"
						required
					/>
					{#if $errors.email}
						<p class="text-destructive text-sm">{$errors.email}</p>
					{/if}
				</Field>

				<Field>
					<div class="flex items-center">
						<FieldLabel for="password">Password</FieldLabel>
						<a
							href="/forgot-password"
							class="text-primary ms-auto text-sm font-medium hover:underline"
						>
							Forgot password?
						</a>
					</div>
					<Input
						id="password"
						name="password"
						type="password"
						bind:value={$form.password}
						class={$errors.password ? 'border-destructive' : ''}
						autocomplete="current-password"
						required
					/>
					{#if $errors.password}
						<p class="text-destructive text-sm">{$errors.password}</p>
					{/if}
				</Field>

				<Field>
					<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
						{#if $submitting}
							<Spinner aria-hidden="true" />
							Signing in…
						{:else}
							Sign in
						{/if}
					</Button>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
