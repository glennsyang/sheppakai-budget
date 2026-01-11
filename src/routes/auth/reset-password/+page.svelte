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
			<h1 class="text-3xl font-bold">Reset Password</h1>
			<p class="mt-2">Enter your new password</p>
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

			<input type="hidden" name="token" bind:value={data.token} />

			<div class="space-y-2">
				<label for="password" class="block text-sm font-medium">New Password</label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="Enter new password (min 8 characters)"
					bind:value={$form.password}
					class={$errors.password ? 'border-red-400 bg-white/80' : 'bg-white/80'}
					autocomplete="new-password"
					required
				/>
				{#if $errors.password}
					<p class="text-sm text-red-200">{$errors.password}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="confirmPassword" class="block text-sm font-medium">Confirm Password</label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					placeholder="Confirm new password"
					bind:value={$form.confirmPassword}
					class={$errors.confirmPassword ? 'border-red-400 bg-white/80' : 'bg-white/80'}
					autocomplete="new-password"
					required
				/>
				{#if $errors.confirmPassword}
					<p class="text-sm text-red-200">{$errors.confirmPassword}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={$submitting}>
				{$submitting ? 'Resetting...' : 'Reset Password'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm">
				<a href="/auth/sign-in" class="font-medium underline"> Back to sign in </a>
			</p>
		</div>
	</div>
</div>
