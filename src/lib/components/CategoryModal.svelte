<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Dialog from '$lib/components/ui/dialog';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';

	interface Props {
		open: boolean;
		initialData?: {
			id?: string;
			name?: string;
			description?: string;
		};
		isEditing?: boolean;
		isLoading?: boolean;
	}

	let {
		open = $bindable(),
		initialData = undefined,
		isEditing = false,
		isLoading = $bindable(false)
	}: Props = $props();

	let id = $state(initialData?.id || '');
	let name = $state(initialData?.name || '');
	let description = $state(initialData?.description || '');

	$effect(() => {
		if (open) {
			if (initialData) {
				id = initialData.id || '';
				name = initialData?.name || '';
				description = initialData?.description || '';
			} else {
				id = '';
				name = '';
				description = '';
			}
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
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
			use:enhance={() => {
				open = false;
				isLoading = true;
				toast.success(isEditing ? 'Category updated!' : 'Category created!', {
					description: `Category: ${name}`
				});

				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.success(isEditing ? 'Category updated!' : 'Category created!', {
							description: `Category: ${name}`
						});
					} else {
						toast.error(`There was an error ${isEditing ? 'updating' : 'creating'} the category.`);
					}
					isLoading = false;
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={id} />

			<div class="space-y-2">
				<label for="category-name" class="text-sm font-medium">Name</label>
				<Input
					id="category-name"
					name="name"
					bind:value={name}
					placeholder="e.g., Groceries, Rent, Utilities"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="category-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="category-description"
					name="description"
					bind:value={description}
					placeholder="A brief description of this category"
					rows={3}
					required
				/>
			</div>

			<Dialog.Footer class="pt-4">
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!name || !description}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
