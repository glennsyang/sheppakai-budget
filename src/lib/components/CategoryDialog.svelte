<script lang="ts">
	import { toast } from 'svelte-sonner';

	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import type { Category } from '$lib/types';

	interface Props {
		open: boolean;
		isEditing?: boolean;
	}

	let { open = $bindable(), isEditing = false }: Props = $props();

	let name = $state('');
	let description = $state('');

	async function handleSubmit(
		event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
	) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);

		try {
			const response = await fetch('/api/category', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(Object.fromEntries(data))
			});

			const newCategory: Category = await response.json();

			if (response.ok) {
				open = false;
				toast.success(
					isEditing ? 'Category updated successfully!' : 'Category created successfully!',
					{
						description: `Category: ${newCategory.name}`
					}
				);
			}
		} catch (error) {
			console.error('Error creating category:', error);
			toast.error('There was an error creating the category. Please try again.');
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add New Category</Dialog.Title>
			<Dialog.Description>
				Create a new category to organize your expenses. You can add a name and a description.
			</Dialog.Description>
		</Dialog.Header>
		<form class="space-y-4" method="POST" onsubmit={handleSubmit}>
			<div class="space-y-2">
				<label for="category-name" class="text-sm font-medium">Name</label>
				<Input
					id="category-name"
					name="name"
					bind:value={name}
					placeholder="e.g., Food, Transportation, Entertainment"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="category-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="category-description"
					name="description"
					bind:value={description}
					placeholder="Brief description of this category..."
					rows={3}
					required
				/>
			</div>
			<Dialog.Footer>
				<Dialog.Close><Button type="reset" variant="outline">Cancel</Button></Dialog.Close>
				<Button type="submit" disabled={!name || !description}>
					{isEditing ? 'Save' : 'Create'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
