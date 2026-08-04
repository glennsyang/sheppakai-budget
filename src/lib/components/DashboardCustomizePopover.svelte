<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { DashboardSectionDefinition } from '$lib/dashboardSections';
	import type { dashboardVisibilitySchema } from '$lib/formSchemas';
	import { SlidersHorizontalIcon } from '@lucide/svelte/icons';
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	interface Props {
		sections: DashboardSectionDefinition[];
		dashboardVisibilityForm: SuperValidated<z.infer<typeof dashboardVisibilitySchema>>;
	}

	let { sections, dashboardVisibilityForm }: Props = $props();

	let open = $state(false);

	const formInstance = $derived(
		superForm(dashboardVisibilityForm, {
			dataType: 'json',
			resetForm: false,
			onUpdate: ({ form }) => {
				// Read form.message, not $message: superforms clears the store on submit and only
				// repopulates it after onUpdate has run, so the store is always undefined here.
				if (form.message?.type === 'success') {
					open = false;
				} else if (form.message?.type === 'error') {
					toast.error(form.message.text);
				}
			},
			onError: ({ result }) => {
				toast.error(
					`There was an error saving your dashboard preferences: ${result.error.message}`
				);
			}
		})
	);

	const { form, enhance, submitting } = $derived(formInstance);

	function toggleSection(key: string, hidden: boolean) {
		if (hidden) {
			if (!$form.hiddenSections.includes(key)) {
				$form.hiddenSections = [...$form.hiddenSections, key];
			}
		} else {
			$form.hiddenSections = $form.hiddenSections.filter((k) => k !== key);
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="gap-2">
				<SlidersHorizontalIcon class="size-4" />
				Customize
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-72" align="end">
		<form method="POST" action="?/updateVisibility" use:enhance class="space-y-3">
			<p class="text-sm font-medium">Dashboard sections</p>
			<div class="space-y-2">
				{#each sections as section (section.key)}
					<label class="flex items-center gap-2 text-sm">
						<Checkbox
							checked={!$form.hiddenSections.includes(section.key)}
							onCheckedChange={(checked) => toggleSection(section.key, !checked)}
						/>
						{section.label}
					</label>
				{/each}
			</div>
			<Button type="submit" size="sm" class="w-full" disabled={$submitting}>
				{$submitting ? 'Saving...' : 'Save'}
			</Button>
		</form>
	</Popover.Content>
</Popover.Root>
