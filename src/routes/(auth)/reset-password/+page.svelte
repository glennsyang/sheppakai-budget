<script lang="ts">
	import { FORGOT_PASSWORD_ROUTE, SIGN_IN_ROUTE } from '$lib/auth-routes';
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Field, FieldGroup, FieldLabel } from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { CircleXIcon } from '@lucide/svelte/icons';
	import { superForm } from 'sveltekit-superforms';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, message, submitting, enhance } = superForm(data.form);
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	{#if data.invalid}
		<Card.Header class="text-center">
			<div
				class="bg-destructive/10 mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full"
			>
				<CircleXIcon class="text-destructive h-8 w-8" />
			</div>
			<Card.Title class="text-2xl">Invalid or expired link</Card.Title>
			<Card.Description>
				This password reset link is no longer valid. Request a new one and we'll email it right
				over.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<FieldGroup>
				<Field>
					<Button href={FORGOT_PASSWORD_ROUTE} class="w-full">Request a new link</Button>
				</Field>
				<Field>
					<a href={SIGN_IN_ROUTE} class="text-center text-sm font-medium underline">
						Back to sign in
					</a>
				</Field>
			</FieldGroup>
		</Card.Content>
	{:else}
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
							placeholder="12+ characters, incl. upper/lower/number/symbol"
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
						<a href={SIGN_IN_ROUTE} class="text-center text-sm font-medium underline">
							Back to sign in
						</a>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{/if}
</Card.Root>
