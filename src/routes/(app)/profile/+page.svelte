<script lang="ts">
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import CheckCircleIcon from '@lucide/svelte/icons/check-circle';
	import EditIcon from '@lucide/svelte/icons/edit';
	import LockIcon from '@lucide/svelte/icons/lock';
	import SaveIcon from '@lucide/svelte/icons/save';
	import UserIcon from '@lucide/svelte/icons/user';
	import XIcon from '@lucide/svelte/icons/x';
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Separator from '$lib/components/ui/separator';

	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Profile editing state
	let isEditingProfile = $state(false);
	let isEditingPassword = $state(false);
	let isLoadingProfile = $state(false);
	let isLoadingPassword = $state(false);

	// Message states
	let profileMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);
	let passwordMessage = $state<{ type: 'success' | 'error'; text: string } | null>(null);

	// Derived values from data
	const userFirstName = $derived(data.user?.firstName || '');
	const userLastName = $derived(data.user?.lastName || '');
	const userEmail = $derived(data.user?.email || '');
	const userUpdatedAt = $derived(data.user?.updatedAt || '');

	// Profile form values (editable state)
	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');

	// Sync form values with data changes
	$effect(() => {
		firstName = userFirstName;
		lastName = userLastName;
		email = userEmail;
	});

	// Password form values
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

	// Reset profile form
	function resetProfileForm() {
		firstName = userFirstName;
		lastName = userLastName;
		email = userEmail;
		isEditingProfile = false;
		profileMessage = null;
	}

	// Reset password form
	function resetPasswordForm() {
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
		isEditingPassword = false;
		passwordMessage = null;
	}

	// Profile form submission
	const submitProfileForm: SubmitFunction = () => {
		isLoadingProfile = true;
		profileMessage = null;
		return async ({ result, update }) => {
			isLoadingProfile = false;
			if (result.type === 'success') {
				isEditingProfile = false;
				profileMessage = { type: 'success', text: 'Profile updated successfully' };
			} else if (result.type === 'failure') {
				profileMessage = { type: 'error', text: result.data?.error || 'Failed to update profile' };
			}
			await update();
		};
	};

	// Password form submission
	const submitPasswordForm: SubmitFunction = () => {
		isLoadingPassword = true;
		passwordMessage = null;
		return async ({ result, update }) => {
			isLoadingPassword = false;
			if (result.type === 'success') {
				resetPasswordForm();
				passwordMessage = { type: 'success', text: 'Password changed successfully' };
			} else if (result.type === 'failure') {
				passwordMessage = {
					type: 'error',
					text: result.data?.error || 'Failed to change password'
				};
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
	<div class="mb-8">
		<h1 class="text-3xl font-bold tracking-tight">Profile</h1>
		<p class="mt-2 text-muted-foreground">Manage your account information and security settings</p>
	</div>

	<div class="space-y-6">
		<!-- Profile Information Section -->
		<div class="overflow-hidden rounded-lg border shadow">
			<div class="p-6">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<UserIcon class="h-5 w-5" />
						<h2 class="text-xl font-semibold">Profile Information</h2>
					</div>
					{#if !isEditingProfile}
						<Button size="sm" variant="outline" onclick={() => (isEditingProfile = true)}>
							<EditIcon class="mr-2 h-4 w-4" />
							Edit
						</Button>
					{/if}
				</div>

				<form method="POST" action="?/update" use:enhance={submitProfileForm}>
					<div class="space-y-4">
						{#if profileMessage}
							<div
								class="flex items-center gap-2 rounded-md p-3 {profileMessage.type === 'success'
									? 'border border-green-200 bg-green-50 text-green-700'
									: 'border border-red-200 bg-red-50 text-red-700'}"
							>
								{#if profileMessage.type === 'success'}
									<CheckCircleIcon class="h-4 w-4" />
								{:else}
									<AlertCircleIcon class="h-4 w-4" />
								{/if}
								<span class="text-sm">{profileMessage.text}</span>
							</div>
						{/if}
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="firstName" class="mb-2 block text-sm font-medium"> First Name </label>
								<Input
									id="firstName"
									name="firstName"
									type="text"
									bind:value={firstName}
									disabled={!isEditingProfile}
									placeholder="Enter your first name"
								/>
							</div>
							<div>
								<label for="lastName" class="mb-2 block text-sm font-medium"> Last Name </label>
								<Input
									id="lastName"
									name="lastName"
									type="text"
									bind:value={lastName}
									disabled={!isEditingProfile}
									placeholder="Enter your last name"
								/>
							</div>
						</div>

						<div>
							<label for="email" class="mb-2 block text-sm font-medium"> Email Address </label>
							<Input
								id="email"
								type="email"
								bind:value={email}
								disabled={true}
								placeholder="Email cannot be changed"
								class="bg-muted"
							/>
							<p class="mt-1 text-xs text-muted-foreground">Email address cannot be changed</p>
						</div>

						{#if isEditingProfile}
							<div class="flex gap-2 pt-4">
								<Button type="submit" size="sm" disabled={isLoadingProfile}>
									{#if isLoadingProfile}
										<div
											class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
										></div>
									{:else}
										<SaveIcon class="mr-2 h-4 w-4" />
									{/if}
									Save Changes
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onclick={resetProfileForm}
									disabled={isLoadingProfile}
								>
									<XIcon class="mr-2 h-4 w-4" />
									Cancel
								</Button>
							</div>
						{/if}
					</div>
				</form>
			</div>
		</div>

		<Separator.Root />

		<!-- Password Change Section -->
		<div class="overflow-hidden rounded-lg border shadow">
			<div class="p-6">
				<div class="mb-4 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<LockIcon class="h-5 w-5" />
						<h2 class="text-xl font-semibold">Change Password</h2>
					</div>
					{#if !isEditingPassword}
						<Button size="sm" variant="outline" onclick={() => (isEditingPassword = true)}>
							<EditIcon class="mr-2 h-4 w-4" />
							Change Password
						</Button>
					{/if}
				</div>

				{#if isEditingPassword}
					<form method="POST" action="?/changePassword" use:enhance={submitPasswordForm}>
						<div class="space-y-4">
							{#if passwordMessage}
								<div
									class="flex items-center gap-2 rounded-md p-3 {passwordMessage.type === 'success'
										? 'border border-green-200 bg-green-50 text-green-700'
										: 'border border-red-200 bg-red-50 text-red-700'}"
								>
									{#if passwordMessage.type === 'success'}
										<CheckCircleIcon class="h-4 w-4" />
									{:else}
										<AlertCircleIcon class="h-4 w-4" />
									{/if}
									<span class="text-sm">{passwordMessage.text}</span>
								</div>
							{/if}
							<div>
								<label for="currentPassword" class="mb-2 block text-sm font-medium">
									Current Password
								</label>
								<Input
									id="currentPassword"
									name="currentPassword"
									type="password"
									bind:value={currentPassword}
									placeholder="Enter your current password"
									required
								/>
							</div>

							<div>
								<label for="newPassword" class="mb-2 block text-sm font-medium">
									New Password
								</label>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									bind:value={newPassword}
									placeholder="Enter your new password"
									required
								/>
							</div>

							<div>
								<label for="confirmPassword" class="mb-2 block text-sm font-medium">
									Confirm New Password
								</label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									bind:value={confirmPassword}
									placeholder="Confirm your new password"
									required
								/>
							</div>

							<div class="flex gap-2 pt-4">
								<Button type="submit" size="sm" disabled={isLoadingPassword}>
									{#if isLoadingPassword}
										<div
											class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
										></div>
									{:else}
										<SaveIcon class="mr-2 h-4 w-4" />
									{/if}
									Change Password
								</Button>
								<Button
									type="button"
									size="sm"
									variant="outline"
									onclick={resetPasswordForm}
									disabled={isLoadingPassword}
								>
									<XIcon class="mr-2 h-4 w-4" />
									Cancel
								</Button>
							</div>
						</div>
					</form>
				{:else}
					<div class="text-sm text-muted-foreground">
						<p>
							Password was last updated on {new Date(userUpdatedAt).toLocaleDateString()}
						</p>
						<p class="mt-1">Click "Change Password" to update your password.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
