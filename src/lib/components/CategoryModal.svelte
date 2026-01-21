<script lang="ts">
	import { toast } from 'svelte-sonner';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import type { z } from 'zod';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { categorySchema } from '$lib/formSchemas';

	import type { BaseModalProps } from '$lib';

	interface Props extends BaseModalProps<z.infer<typeof categorySchema>> {
		categoryForm: SuperValidated<z.infer<typeof categorySchema>>;
	}

	let {
		open = $bindable(),
		initialData = undefined,
		isEditing = false,
		isLoading = $bindable(false),
		categoryForm
	}: Props = $props();

	const formInstance = $derived(
		superForm(categoryForm, {
			resetForm: true,
			onUpdate: ({ form }) => {
				if (form.valid) {
					open = false;
					toast.success(
						isEditing ? 'Category updated successfully!' : 'Category created successfully!'
					);
				}
				if ($message?.type === 'error') {
					toast.error(
						`Error ${isEditing ? 'updating' : 'creating'} category. Reason: ${$message.text}`
					);
				}
			},
			onError: ({ result }) => {
				// Catastrophic DB crashes (Form data is lost)
				toast.error(
					`There was an error ${isEditing ? 'updating' : 'creating'} the category. Reason: ${result.error.message}`
				);
			}
		})
	);

	const { form, errors, enhance, message, submitting } = $derived(formInstance);

	$effect(() => {
		if (open) {
			if (initialData) {
				$form.id = initialData.id || '';
				$form.name = initialData?.name || '';
				$form.description = initialData?.description || '';
			} else {
				$form.id = '';
				$form.name = '';
				$form.description = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{isEditing ? 'Edit Category' : 'Add New Category'}</Dialog.Title>
			<Dialog.Description>
				{isEditing
					? 'Update this category. Modify the name and description as needed.'
					: 'Create a new category to organize your expenses.'}
			</Dialog.Description>
		</Dialog.Header>
		<form
			class="space-y-4"
			method="POST"
			action={isEditing ? '/setup/categories?/update' : '/setup/categories?/create'}
			use:enhance
		>
			<input type="hidden" name="id" bind:value={$form.id} />

			<div class="space-y-2">
				<label for="category-name" class="text-sm font-medium">Name</label>
				<Input
					id="category-name"
					name="name"
					bind:value={$form.name}
					placeholder="e.g., Groceries, Rent, Utilities"
					class={$errors.name ? 'border-red-400' : ''}
					required
				/>
				{#if $errors.name}
					<p class="text-sm text-red-500">{$errors.name}</p>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="category-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="category-description"
					name="description"
					bind:value={$form.description}
					placeholder="A brief description of this category"
					class={$errors.description ? 'border-red-400' : ''}
					rows={3}
					required
				/>
				{#if $errors.description}
					<p class="text-sm text-red-500">{$errors.description}</p>
				{/if}
			</div>

			<Dialog.Footer class="pt-4">
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={$submitting}>
					{$submitting ? 'Saving...' : isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
