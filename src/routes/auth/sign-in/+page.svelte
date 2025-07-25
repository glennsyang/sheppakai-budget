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
	<div class="w-full max-w-md space-y-6 p-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Sign In</h1>
			<p class="mt-2 text-gray-600">Enter your credentials to access your account</p>
		</div>

		<form method="POST" use:enhance class="space-y-4">
			{#if $message}
				<div class="rounded-md p-4 {$message.includes('successful') ? 'bg-green-50' : 'bg-red-50'}">
					<div
						class="text-sm {$message.includes('successful') ? 'text-green-700' : 'text-red-700'}"
					>
						{$message}
					</div>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
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
					<p class="text-sm text-red-600">{$errors.email}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
				<Input
					id="password"
					name="password"
					type="password"
					placeholder="Enter your password"
					bind:value={$form.password}
					class={$errors.password ? 'border-red-500' : ''}
					autocomplete="current-password"
					required
				/>
				{#if $errors.password}
					<p class="text-sm text-red-600">{$errors.password}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full" disabled={$submitting}>
				{$submitting ? 'Signing In...' : 'Sign In'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm text-gray-600">
				Don't have an account?
				<a href="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">
					Register here
				</a>
			</p>
		</div>
	</div>
</div>
