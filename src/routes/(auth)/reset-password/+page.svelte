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

<Card.Root class="w-full">
	{#if data.invalid}
		<Card.Header>
			<CircleXIcon class="text-destructive mb-1 size-5" aria-hidden="true" />
			<Card.Title class="text-xl tracking-tight">Invalid or expired link</Card.Title>
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
					<a href={SIGN_IN_ROUTE} class="text-primary text-sm font-medium hover:underline">
						Back to sign in
					</a>
				</Field>
			</FieldGroup>
		</Card.Content>
	{:else}
		<Card.Header>
			<Card.Title class="text-xl tracking-tight">Choose a new password</Card.Title>
			<Card.Description
				>12 or more characters, with upper and lower case, a number and a symbol.</Card.Description
			>
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
							bind:value={$form.password}
							class={$errors.password ? 'border-destructive' : ''}
							autocomplete="new-password"
							required
						/>
						{#if $errors.password}
							<p class="text-destructive text-sm">{$errors.password}</p>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="confirmPassword">Confirm Password</FieldLabel>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							bind:value={$form.confirmPassword}
							class={$errors.confirmPassword ? 'border-destructive' : ''}
							autocomplete="new-password"
							required
						/>
						{#if $errors.confirmPassword}
							<p class="text-destructive text-sm">{$errors.confirmPassword}</p>
						{/if}
					</Field>

					<Field>
						<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
							{#if $submitting}
								<Spinner aria-hidden="true" />
								Saving…
							{:else}
								Save new password
							{/if}
						</Button>
					</Field>

					<Field>
						<a href={SIGN_IN_ROUTE} class="text-primary text-sm font-medium hover:underline">
							Back to sign in
						</a>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{/if}
</Card.Root>
