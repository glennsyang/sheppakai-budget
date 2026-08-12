<script lang="ts">
	import { API_SCOPES, type ApiScope } from '$lib/api-scopes';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import DataTable from '$lib/components/ui/data-table/data-table.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { revokeApiKeyFormContext } from '$lib/contexts';
	import type { createApiKeySchema, idSchema } from '$lib/formSchemas';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import { toast } from 'svelte-sonner';
	import { superForm, type SuperValidated } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { columns, type AdminApiKey } from './columns';

	interface Props {
		data: {
			apiKeys: AdminApiKey[];
			loadError?: string;
			createForm: SuperValidated<z.infer<typeof createApiKeySchema>>;
			revokeForm: SuperValidated<z.infer<typeof idSchema>>;
		};
	}

	let { data }: Props = $props();

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
	<title>API Keys</title>
</svelte:head>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold">API Keys</h2>
		<p class="text-muted-foreground">
			Manage keys for external tools (e.g. a personal AI assistant) to call the external API under <code
				>/api/v1</code
			>.
		</p>
	</div>

	{#if revealedKey}
		<Card class="border-amber-300 bg-amber-50">
			<CardHeader>
				<CardTitle class="text-amber-900">Copy your new API key now</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<p class="text-sm text-amber-900">
					This is the only time this key will be shown. Store it somewhere safe.
				</p>
				<div class="flex gap-2">
					<Input readonly value={revealedKey} class="font-mono text-sm" />
					<Button type="button" variant="outline" onclick={copyRevealedKey}>
						<CopyIcon class="size-4" />
						Copy
					</Button>
				</div>
				<Button type="button" variant="ghost" size="sm" onclick={() => (revealedKey = null)}>
					Done
				</Button>
			</CardContent>
		</Card>
	{/if}

	<Card>
		<CardHeader>
			<CardTitle>Create a new key</CardTitle>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/create" use:enhance class="space-y-4">
				<div>
					<Label for="key-name" class="mb-2 block">Name</Label>
					<Input
						id="key-name"
						name="name"
						bind:value={$form.name}
						placeholder="e.g. Dash assistant"
						class={$errors.name ? 'border-red-400' : ''}
					/>
					{#if $errors.name}
						<p class="mt-1 text-sm text-red-600">{$errors.name}</p>
					{/if}
				</div>

				<div>
					<span class="mb-2 block text-sm font-medium">Scopes</span>
					<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
						{#each API_SCOPES as scope (scope)}
							<label class="flex items-center gap-2 text-sm">
								<Checkbox
									checked={$form.scopes.includes(scope)}
									onCheckedChange={(checked) => toggleScope(scope, Boolean(checked))}
								/>
								{scope}
							</label>
						{/each}
					</div>
					{#if $errors.scopes}
						<p class="mt-1 text-sm text-red-600">{$errors.scopes}</p>
					{/if}
				</div>

				<div>
					<Label for="key-expires" class="mb-2 block">Expires in (days, optional)</Label>
					<Input
						id="key-expires"
						name="expiresInDays"
						type="number"
						min="1"
						max="365"
						bind:value={$form.expiresInDays}
						placeholder="Never expires"
						class="max-w-40"
					/>
				</div>

				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Creating...' : 'Create key'}
				</Button>
			</form>
		</CardContent>
	</Card>

	{#if data.loadError}
		<div
			class="border-destructive/50 bg-destructive/10 text-destructive rounded-md border p-4 text-sm"
		>
			{data.loadError}
		</div>
	{:else if data.apiKeys.length === 0}
		<div class="flex h-32 items-center justify-center rounded-lg border border-dashed">
			<p class="text-muted-foreground">No API keys yet</p>
		</div>
	{:else}
		<DataTable {columns} data={data.apiKeys} />
	{/if}
</div>
