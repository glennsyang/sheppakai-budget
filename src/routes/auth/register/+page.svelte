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

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500"
>
	<!-- Header with logo -->
	<header
		class="absolute top-0 w-full border-b border-white/20 bg-white/10 shadow-lg backdrop-blur-md"
	>
		<div class="container mx-auto flex items-center justify-center px-4 py-3">
			<div class="text-xl font-bold text-white">Budget Tracker</div>
		</div>
	</header>

	<div
		class="mx-4 w-full max-w-md space-y-6 rounded-xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
	>
		<div class="text-center">
			<h1 class="text-3xl font-bold text-white">Register</h1>
			<p class="mt-2 text-white/90">Create your account to get started</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			{#if $message}
				<div class="rounded-md bg-red-50/80 p-4 backdrop-blur-sm">
					<div class="text-sm text-red-700">{$message}</div>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="email" class="block text-sm font-medium text-white">Email</label>
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
				<label for="password" class="block text-sm font-medium text-white">Password</label>
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
				<label for="confirmPassword" class="block text-sm font-medium text-white"
					>Confirm Password</label
				>
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

			<Button
				type="submit"
				class="w-full bg-white text-teal-700 hover:bg-white/90"
				disabled={$submitting}
			>
				{$submitting ? 'Creating Account...' : 'Register'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm text-white">
				Already have an account?
				<a href="/auth/sign-in" class="font-medium text-white/90 underline hover:text-white">
					Sign in here
				</a>
			</p>
		</div>
	</div>
</div>
