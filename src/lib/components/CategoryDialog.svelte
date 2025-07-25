<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onCategoryAdded?: () => void;
	}

	let { open = $bindable(), onOpenChange, onCategoryAdded }: Props = $props();

	let name = $state('');
	let description = $state('');
	let submitting = $state(false);

	async function handleSubmit(event?: Event) {
		event?.preventDefault();
		if (!name.trim()) return;

		submitting = true;
		try {
			const response = await fetch('/api/categories', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || undefined
				})
			});

			if (response.ok) {
				// Reset form
				name = '';
				description = '';
				onOpenChange(false);

				// Notify parent component
				onCategoryAdded?.();
			} else {
				console.error('Failed to create category');
			}
		} catch (error) {
			console.error('Error creating category:', error);
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog {open} {onOpenChange}>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>Add New Category</DialogTitle>
			<DialogDescription>
				Create a new category to organize your expenses. You can add a name and optional
				description.
			</DialogDescription>
		</DialogHeader>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="category-name" class="text-sm font-medium">Name</label>
				<Input
					id="category-name"
					bind:value={name}
					placeholder="e.g., Food, Transportation, Entertainment"
					required
				/>
			</div>
			<div class="space-y-2">
				<label for="category-description" class="text-sm font-medium">Description (optional)</label>
				<Textarea
					id="category-description"
					bind:value={description}
					placeholder="Brief description of this category..."
					rows={3}
				/>
			</div>
		</form>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button type="button" onclick={handleSubmit} disabled={submitting || !name.trim()}>
				{submitting ? 'Creating...' : 'Create Category'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
