<script lang="ts">
	import AuthFormMessage from '$lib/components/AuthFormMessage.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { MailIcon } from '@lucide/svelte/icons';
	import { superForm } from 'sveltekit-superforms';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, enhance, message, submitting } = superForm(data.verificationForm);
</script>

<svelte:head>
	<title>Verify Your Email - Sheppakai Budget</title>
</svelte:head>

<Card.Root class="w-full">
	<Card.Header>
		<MailIcon class="text-primary mb-1 size-5" aria-hidden="true" />
		<Card.Title class="text-xl tracking-tight">Check your email</Card.Title>
		<Card.Description>
			We sent a verification link to <span class="text-foreground font-medium">{data.email}</span>.
		</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<AuthFormMessage message={$message} />

		<ol class="text-muted-foreground flex flex-col gap-2 text-sm">
			<li class="flex gap-2.5">
				<span class="text-foreground w-3 shrink-0 font-medium tabular-nums">1</span>
				Open the email we just sent.
			</li>
			<li class="flex gap-2.5">
				<span class="text-foreground w-3 shrink-0 font-medium tabular-nums">2</span>
				Tap the verification link.
			</li>
			<li class="flex gap-2.5">
				<span class="text-foreground w-3 shrink-0 font-medium tabular-nums">3</span>
				You'll be signed in and taken to your dashboard.
			</li>
		</ol>

		<p class="bg-muted/60 text-muted-foreground rounded-[10px] px-3 py-2.5 text-xs">
			Not there? Check spam or junk. The link expires in 10 minutes.
		</p>

		<form method="POST" action="?/resend" use:enhance class="flex flex-col gap-2">
			<input type="hidden" name="email" bind:value={$form.email} />
			<Button
				type="submit"
				variant="outline"
				class="w-full"
				disabled={$submitting}
				aria-busy={$submitting}
			>
				{$submitting ? 'Sending…' : 'Resend verification email'}
			</Button>
			{#if $errors.email}
				<p class="text-destructive text-xs">{$errors.email}</p>
			{/if}
		</form>
		<Button href="/sign-in" variant="ghost" class="w-full">Back to sign in</Button>
	</Card.Content>
</Card.Root>
