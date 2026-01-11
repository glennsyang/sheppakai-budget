<script lang="ts">
	import { superForm } from 'sveltekit-superforms';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	const { form, errors, message, submitting } = superForm(data.form, {
		onUpdated: ({ form }) => {
			if (form.message) {
				// The error message will be displayed below
			}
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div
		class="mx-4 w-full max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
	>
		<div class="text-center">
			<h1 class="text-3xl font-bold">Forgot Password</h1>
			<p class="mt-2">Enter your email to receive a password reset link</p>
		</div>

		<form method="POST" class="space-y-4">
			{#if $message}
				<div
					class="rounded-md p-4 {$message.includes('successful')
						? 'bg-green-50/80'
						: 'bg-red-50/80'} backdrop-blur-sm"
				>
					<div
						class="text-sm {$message.includes('successful') ? 'text-green-700' : 'text-red-700'}"
					>
						{$message}
					</div>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="email" class="block text-sm font-medium">Email</label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="Enter your email"
					bind:value={$form.email}
					class={$errors.email ? 'border-red-400 bg-white/80' : 'bg-white/80'}
					autocomplete="email"
					required
				/>
			</div>

			<Button type="submit" class="w-full" disabled={$submitting}>
				{$submitting ? 'Sending...' : 'Send Reset Link'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm">
				Remember your password?
				<a href="/auth/sign-in" class="font-medium underline"> Sign in here </a>
			</p>
		</div>
	</div>
</div>
