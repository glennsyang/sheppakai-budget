<script lang="ts">
	import { API_SCOPES, type ApiScope } from '$lib/api-scopes';
	import LoadErrorBanner from '$lib/components/LoadErrorBanner.svelte';
	import SectionHeader from '$lib/components/SectionHeader.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { revokeApiKeyFormContext } from '$lib/contexts';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import KeyRoundIcon from '@lucide/svelte/icons/key-round';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

	import type { PageProps } from './$types';
	import { columns } from './columns';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	revokeApiKeyFormContext.set(data.revokeForm);

	let revealedKey = $state<string | null>(null);

	const createFormInstance = $derived(
		superForm(data.createForm, {
			id: 'createApiKey',
			dataType: 'json',
			resetForm: true,
			onUpdate: ({ form, result }) => {
				// Read form.message, not $message: superforms clears the store on submit and only
				// repopulates it after onUpdate has run, so the store is always undefined here.
				if (form.message?.type === 'success') {
					toast.success(form.message.text);
					const resultData = result.data as { apiKey?: string } | undefined;
					revealedKey = resultData?.apiKey ?? null;
				} else if (form.message?.type === 'error') {
					toast.error(form.message.text);
				}
			},
			onError: ({ result }) => {
				toast.error(`Failed to create API key: ${result.error.message}`);
			}
		})
	);

	const { form, errors, enhance, submitting } = $derived(createFormInstance);

	function toggleScope(scope: ApiScope, checked: boolean) {
		if (checked) {
			if (!$form.scopes.includes(scope)) {
				$form.scopes = [...$form.scopes, scope];
			}
		} else {
			$form.scopes = $form.scopes.filter((s) => s !== scope);
		}
	}

	async function copyRevealedKey() {
		if (!revealedKey) return;
		await navigator.clipboard.writeText(revealedKey);
		toast.success('Copied to clipboard.');
	}
</script>

<svelte:head>
	<title>API keys · Admin</title>
</svelte:head>

<SectionHeader
	title="API keys"
	description="Scoped keys that let outside tools, like a service account or an assistant, use the API"
/>

{#if revealedKey}
	<section
		class="bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:p-5"
		aria-live="polite"
	>
		<div class="flex items-start gap-3">
			<KeyRoundIcon class="text-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
			<div>
				<h3 class="text-sm font-semibold">Copy your new key now</h3>
				<p class="text-muted-foreground text-sm">
					This is the only time it will be shown. Store it somewhere safe.
				</p>
			</div>
		</div>
		<div class="flex flex-col gap-2 sm:flex-row">
			<Input readonly value={revealedKey} class="font-mono text-sm" aria-label="New API key" />
			<div class="flex gap-2">
				<Button type="button" onclick={copyRevealedKey}>
					<CopyIcon />
					Copy
				</Button>
				<Button type="button" variant="ghost" onclick={() => (revealedKey = null)}>Done</Button>
			</div>
		</div>
	</section>
{/if}

<section
	class="bg-card grid gap-x-8 gap-y-4 rounded-xl border p-4 shadow-sm sm:p-6 lg:grid-cols-[16rem_minmax(0,1fr)]"
>
	<div>
		<h3 class="text-base font-semibold tracking-tight">New key</h3>
		<p class="text-muted-foreground mt-1 text-sm">Give it only the scopes the tool needs.</p>
	</div>
	<form method="POST" action="?/create" use:enhance class="flex max-w-2xl flex-col gap-5">
		<div class="flex flex-col gap-2">
			<Label for="key-name">Name</Label>
			<Input
				id="key-name"
				name="name"
				bind:value={$form.name}
				placeholder="e.g. Household assistant"
				aria-invalid={$errors.name ? 'true' : undefined}
			/>
			{#if $errors.name}
				<p class="text-destructive text-xs">{$errors.name}</p>
			{/if}
		</div>

		<fieldset class="flex flex-col gap-2">
			<legend class="mb-2 text-sm font-medium">Scopes</legend>
			<div class="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
				{#each API_SCOPES as scope (scope)}
					<label
						class="hover:bg-muted/60 -mx-2 flex min-h-11 items-center gap-2.5 rounded-md px-2 font-mono text-xs md:min-h-8"
					>
						<Checkbox
							checked={$form.scopes.includes(scope)}
							onCheckedChange={(checked) => toggleScope(scope, Boolean(checked))}
						/>
						{scope}
					</label>
				{/each}
			</div>
			{#if $errors.scopes}
				<p class="text-destructive text-xs">{$errors.scopes}</p>
			{/if}
		</fieldset>

		<div class="flex flex-col gap-2">
			<Label for="key-expires">Expires after (days)</Label>
			<Input
				id="key-expires"
				name="expiresInDays"
				type="number"
				inputmode="numeric"
				min="1"
				max="365"
				bind:value={$form.expiresInDays}
				placeholder="Never"
				class="max-w-40 tabular-nums"
			/>
			<p class="text-muted-foreground text-xs">Leave empty for a key that never expires.</p>
		</div>

		<div>
			<Button type="submit" disabled={$submitting} aria-busy={$submitting}>
				{$submitting ? 'Creating…' : 'Create key'}
			</Button>
		</div>
	</form>
</section>

{#if data.loadError}
	<LoadErrorBanner message={data.loadError} />
{:else}
	<DataTable
		{columns}
		data={data.apiKeys}
		searchable={data.apiKeys.length > 10}
		emptyMessage="No API keys yet."
	/>
{/if}
