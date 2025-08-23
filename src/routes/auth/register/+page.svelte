<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const { form, errors, message, enhance, submitting } = superForm(data.form, {
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
			<h1 class="text-3xl font-bold">Register</h1>
			<p class="mt-2">Create your account to get started</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			{#if $message}
				<div class="rounded-md bg-red-50/80 p-4 backdrop-blur-sm">
					<div class="text-sm text-red-700">{$message}</div>
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
				{#if $errors.email}
					<p class="text-sm text-red-200">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="password" class="block text-sm font-medium">Password</label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="Enter your password"
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
					placeholder="Confirm your password"
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
				{$submitting ? 'Creating Account...' : 'Register'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm">
				Already have an account
				<a href="/auth/sign-in" class="font-medium underline"> Sign in here </a>
			</p>
		</div>
	</div>
</div>
