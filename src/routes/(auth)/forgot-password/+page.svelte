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

<Card.Root class="w-full">
	<Card.Header>
		<Card.Title class="text-xl tracking-tight">Reset your password</Card.Title>
		<Card.Description
			>Enter your email and we'll send a reset link. It expires in 10 minutes.</Card.Description
		>
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
					<Button type="submit" class="w-full" disabled={$submitting} aria-busy={$submitting}>
						{#if $submitting}
							<Spinner aria-hidden="true" />
							Sending…
						{:else}
							Send reset link
						{/if}
					</Button>
					<FieldDescription>
						Remember your password? <a
							href="/sign-in"
							class="text-primary font-medium hover:underline">Sign in</a
						>
					</FieldDescription>
				</Field>
			</FieldGroup>
		</form>
	</Card.Content>
</Card.Root>
