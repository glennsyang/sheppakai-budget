<script lang="ts">
	import FormMessage from '$lib/components/FormMessage.svelte';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import PageShell from '$lib/components/PageShell.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { superForm } from 'sveltekit-superforms';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Profile form
	// svelte-ignore state_referenced_locally
	const profileFormStore = superForm(data.profileForm, {
		onUpdate: ({ form }) => {
			if (form.message?.type === 'success') {
				isEditingProfile = false;
			}
		}
	});

	const {
		form: profileForm,
		errors: profileErrors,
		message: profileMessage,
		submitting: profileSubmitting,
		enhance: profileEnhance
	} = profileFormStore;

	// Password form
	// svelte-ignore state_referenced_locally
	const passwordFormStore = superForm(data.passwordForm, {
		resetForm: true,
		onUpdate: ({ form }) => {
			if (form.message?.type === 'success') {
				isEditingPassword = false;
			}
		}
	});

	const {
		form: passwordForm,
		errors: passwordErrors,
		message: passwordMessage,
		submitting: passwordSubmitting,
		enhance: passwordEnhance
	} = passwordFormStore;

	// Profile editing state
	let isEditingProfile = $state(false);
	let isEditingPassword = $state(false);

	// Derived values from data
	const userEmail = $derived(data.user?.email || '');
	const passwordUpdatedAt = $derived(data.passwordUpdatedAt || '');

	// Reset profile form
	function resetProfileForm() {
		$profileForm.name = data.user?.name || '';
		isEditingProfile = false;
	}

	// Reset password form
	function resetPasswordForm() {
		$passwordForm.currentPassword = '';
		$passwordForm.newPassword = '';
		$passwordForm.confirmPassword = '';
		isEditingPassword = false;
	}
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

{#snippet fieldError(message: string[] | undefined)}
	{#if message}
		<p class="text-destructive text-xs">{message}</p>
	{/if}
{/snippet}

<PageShell title="Profile" subtitle="Your account details and password">
	{#if data.loadError}
		<LoadErrorBanner message={data.loadError} />
	{/if}

	<section
		class="bg-card grid gap-x-8 gap-y-4 rounded-xl border p-4 shadow-sm sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
	>
		<div>
			<h2 class="text-base font-semibold tracking-tight">Account</h2>
			<p class="text-muted-foreground mt-1 text-sm">The name shown around the app.</p>
		</div>

		<form method="POST" action="?/update" use:profileEnhance class="flex max-w-lg flex-col gap-4">
			{#if $profileMessage}
				<FormMessage type={$profileMessage.type} text={$profileMessage.text} />
			{/if}
			<div class="flex flex-col gap-2">
				<label for="name" class="text-sm font-medium">Name</label>
				<Input
					id="name"
					name="name"
					type="text"
					autocomplete="given-name"
					bind:value={$profileForm.name}
					disabled={!isEditingProfile}
					placeholder="Your first name"
					aria-invalid={$profileErrors.name ? 'true' : undefined}
				/>
				{@render fieldError($profileErrors.name)}
			</div>

			<div class="flex flex-col gap-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<Input id="email" type="email" value={userEmail} disabled />
				<p class="text-muted-foreground text-xs">Your sign-in email can't be changed here.</p>
			</div>

			<div class="flex gap-2 pt-1">
				{#if isEditingProfile}
					<Button type="submit" disabled={$profileSubmitting} aria-busy={$profileSubmitting}>
						{#if $profileSubmitting}<Spinner aria-hidden="true" />{/if}
						Save name
					</Button>
					<Button
						type="button"
						variant="ghost"
						onclick={resetProfileForm}
						disabled={$profileSubmitting}
					>
						Cancel
					</Button>
				{:else}
					<Button type="button" variant="outline" onclick={() => (isEditingProfile = true)}>
						Edit name
					</Button>
				{/if}
			</div>
		</form>
	</section>

	<section
		class="bg-card grid gap-x-8 gap-y-4 rounded-xl border p-4 shadow-sm sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
	>
		<div>
			<h2 class="text-base font-semibold tracking-tight">Password</h2>
			<p class="text-muted-foreground mt-1 text-sm">
				{#if passwordUpdatedAt}
					Last changed {new Date(passwordUpdatedAt).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric'
					})}.
				{:else}
					At least 12 characters.
				{/if}
			</p>
		</div>

		{#if isEditingPassword}
			<form
				method="POST"
				action="?/changePassword"
				use:passwordEnhance
				class="flex max-w-lg flex-col gap-4"
			>
				{#if $passwordMessage}
					<FormMessage type={$passwordMessage.type} text={$passwordMessage.text} />
				{/if}
				<div class="flex flex-col gap-2">
					<label for="currentPassword" class="text-sm font-medium">Current password</label>
					<Input
						id="currentPassword"
						name="currentPassword"
						type="password"
						autocomplete="current-password"
						bind:value={$passwordForm.currentPassword}
						aria-invalid={$passwordErrors.currentPassword ? 'true' : undefined}
						required
					/>
					{@render fieldError($passwordErrors.currentPassword)}
				</div>
				<div class="flex flex-col gap-2">
					<label for="newPassword" class="text-sm font-medium">New password</label>
					<Input
						id="newPassword"
						name="newPassword"
						type="password"
						autocomplete="new-password"
						bind:value={$passwordForm.newPassword}
						aria-invalid={$passwordErrors.newPassword ? 'true' : undefined}
						required
					/>
					{@render fieldError($passwordErrors.newPassword)}
				</div>
				<div class="flex flex-col gap-2">
					<label for="confirmPassword" class="text-sm font-medium">Confirm new password</label>
					<Input
						id="confirmPassword"
						name="confirmPassword"
						type="password"
						autocomplete="new-password"
						bind:value={$passwordForm.confirmPassword}
						aria-invalid={$passwordErrors.confirmPassword ? 'true' : undefined}
						required
					/>
					{@render fieldError($passwordErrors.confirmPassword)}
				</div>
				<div class="flex gap-2 pt-1">
					<Button type="submit" disabled={$passwordSubmitting} aria-busy={$passwordSubmitting}>
						{#if $passwordSubmitting}<Spinner aria-hidden="true" />{/if}
						Change password
					</Button>
					<Button
						type="button"
						variant="ghost"
						onclick={resetPasswordForm}
						disabled={$passwordSubmitting}
					>
						Cancel
					</Button>
				</div>
			</form>
		{:else}
			<div class="flex flex-col items-start gap-3">
				{#if $passwordMessage}
					<FormMessage type={$passwordMessage.type} text={$passwordMessage.text} />
				{/if}
				<Button type="button" variant="outline" onclick={() => (isEditingPassword = true)}>
					Change password
				</Button>
			</div>
		{/if}
	</section>
</PageShell>
