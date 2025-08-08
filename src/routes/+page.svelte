<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	// If user is authenticated, redirect to dashboard
	onMount(() => {
		if ($page.data.user) {
			goto('/dashboard');
		}
	});

	const handleSignIn = () => goto('/auth/sign-in');
	const handleRegister = () => goto('/auth/register');
</script>

<div class="flex min-h-screen flex-col bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500">
	<!-- Navigation Bar -->
	<header class="w-full border-b border-white/20 bg-white/10 shadow-lg backdrop-blur-md">
		<div class="container mx-auto flex items-center justify-between px-4 py-3">
			<div class="text-xl font-bold text-white">Budget Tracker</div>
			<div class="space-x-2">
				<Button
					variant="outline"
					class="bg-white/20 text-white hover:bg-white/30"
					onclick={handleSignIn}>Sign In</Button
				>
				<Button class="bg-white text-purple-700 hover:bg-white/90" onclick={handleRegister}
					>Register</Button
				>
			</div>
		</div>
	</header>

	<!-- Splash Screen Content -->
	<main class="flex flex-grow items-center justify-center">
		<div
			class="mx-4 w-full max-w-xl rounded-xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md"
		>
			<h1 class="mb-6 text-4xl font-bold text-white md:text-5xl">Welcome to Sheppakai Budget</h1>
			<p class="mb-8 text-lg text-white/90">
				Take control of your finances with our powerful budgeting tools.
			</p>
			<div class="flex flex-col justify-center gap-4 sm:flex-row">
				<Button
					size="lg"
					class="bg-white text-purple-700 hover:bg-white/90"
					onclick={handleRegister}>Get Started</Button
				>
				<Button
					size="lg"
					variant="outline"
					class="bg-white/20 text-white hover:bg-white/30"
					onclick={handleSignIn}>Sign In</Button
				>
			</div>
		</div>
	</main>
</div>
