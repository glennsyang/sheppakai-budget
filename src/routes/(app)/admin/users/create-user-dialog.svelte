<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { createUserSchema } from '$lib/formSchemas';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	let { data }: { data: SuperValidated<z.infer<typeof createUserSchema>> } = $props();

	let open = $state(false);
	// Set when the new user's email isn't in ALLOWED_EMAILS: the dialog stays open to show it.
	let allowlistCommand = $state<string | null>(null);

	// svelte-ignore state_referenced_locally
	const { form, errors, message, enhance, submitting, reset } = superForm(data, {
		id: 'createUser',
		resetForm: true,
		onUpdate: ({ form, result }) => {
			// Read form.message, not $message: superforms clears the store on submit and only
			// repopulates it after onUpdate has run, so the store is always undefined here.
			if (form.message?.type !== 'success') return;

			toast.success(form.message.text);
			const resultData = result.data as { allowlistCommand?: string } | undefined;
			allowlistCommand = resultData?.allowlistCommand ?? null;
			if (!allowlistCommand) open = false;
		},
		onError: ({ result }) => {
			toast.error(`Failed to create user: ${result.error.message}`);
		}
	});

	$effect(() => {
		if (!open) {
			allowlistCommand = null;
			reset();
		}
	});

	async function copyCommand() {
		if (!allowlistCommand) return;
		await navigator.clipboard.writeText(allowlistCommand);
		toast.success('Copied to clipboard.');
	}
</script>

<Button onclick={() => (open = true)}>
	<UserPlusIcon class="size-4" />
	Add User
</Button>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add User</Dialog.Title>
			<Dialog.Description>
				They'll get a welcome email with a link to set their own password.
			</Dialog.Description>
		</Dialog.Header>

		{#if allowlistCommand}
			<div
				class="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
			>
				<p>
					<strong>User created, but they can't sign in yet.</strong> Their email isn't in the
					<code>ALLOWED_EMAILS</code> Fly secret. Run:
				</p>
				<div class="flex gap-2">
					<Input
						readonly
						value={allowlistCommand}
						class="border-amber-300 bg-white font-mono text-xs text-amber-950 dark:bg-white"
					/>
					<Button
						type="button"
						variant="outline"
						class="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 hover:text-amber-900 dark:bg-white dark:hover:bg-amber-100"
						onclick={copyCommand}
					>
						<CopyIcon class="size-4" />
						Copy
					</Button>
				</div>
				<p>
					Once the app has restarted, use <strong>Send Welcome Email</strong> from the user's row actions.
				</p>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (open = false)}>Done</Button>
			</Dialog.Footer>
		{:else}
			<form class="space-y-4" method="POST" action="/admin/users?/createUser" use:enhance>
				{#if $message?.type === 'error'}
					<div
						class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
						role="alert"
					>
						{$message.text}
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="create-user-name">Name</Label>
					<Input
						id="create-user-name"
						name="name"
						bind:value={$form.name}
						class={$errors.name ? 'border-red-400' : ''}
						required
						maxlength={100}
					/>
					{#if $errors.name}
						<p class="text-sm text-red-500">{$errors.name}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="create-user-email">Email</Label>
					<Input
						id="create-user-email"
						name="email"
						type="email"
						autocomplete="off"
						bind:value={$form.email}
						class={$errors.email ? 'border-red-400' : ''}
						required
					/>
					{#if $errors.email}
						<p class="text-sm text-red-500">{$errors.email}</p>
					{/if}
				</div>

				<div class="space-y-2">
					<Label for="create-user-role">Role</Label>
					<Select.Root type="single" bind:value={$form.role}>
						<Select.Trigger id="create-user-role" class="w-full">
							{$form.role === 'admin' ? 'Admin' : 'User'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="user" label="User">User</Select.Item>
							<Select.Item value="admin" label="Admin">Admin</Select.Item>
						</Select.Content>
					</Select.Root>
					<input type="hidden" name="role" value={$form.role} />
				</div>

				<Dialog.Footer>
					<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
					<Button type="submit" disabled={$submitting}>
						{$submitting ? 'Creating...' : 'Create User'}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
