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
	import { onMount } from 'svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
		onIncomeAdded?: () => void;
	}

	let { open = $bindable(), onOpenChange, onIncomeAdded }: Props = $props();

	let amount = $state('');
	let description = $state('');
	let date = $state('');
	let submitting = $state(false);

	// Set default date to today
	function setDefaultDate() {
		const today = new Date();
		date = today.toISOString().split('T')[0];
	}

	async function handleSubmit(event?: Event) {
		event?.preventDefault();

		const numAmount = parseFloat(amount);
		if (!numAmount || numAmount <= 0) {
			alert('Please enter a valid amount');
			return;
		}

		if (!date) {
			alert('Please select a date');
			return;
		}

		submitting = true;
		try {
			const response = await fetch('/api/income', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					amount: numAmount,
					description: description.trim() || undefined,
					date: date
				})
			});

			if (response.ok) {
				// Reset form
				amount = '';
				description = '';
				setDefaultDate();
				onOpenChange(false);

				// Notify parent component
				onIncomeAdded?.();
			} else {
				const errorData = await response.json();
				alert(errorData.error || 'Failed to create income entry');
			}
		} catch (error) {
			console.error('Error creating income:', error);
			alert('Failed to create income entry');
		} finally {
			submitting = false;
		}
	}

	onMount(() => {
		setDefaultDate();
	});
</script>

<Dialog {open} {onOpenChange}>
	<DialogContent class="sm:max-w-[425px]">
		<DialogHeader>
			<DialogTitle>Add New Income</DialogTitle>
			<DialogDescription>
				Record a new income entry. Fill in the amount, description, and date.
			</DialogDescription>
		</DialogHeader>
		<form onsubmit={handleSubmit} class="space-y-4">
			<div class="space-y-2">
				<label for="income-amount" class="text-sm font-medium">Amount</label>
				<Input
					id="income-amount"
					type="number"
					step="0.01"
					min="0"
					bind:value={amount}
					placeholder="0.00"
					required
				/>
			</div>

			<div class="space-y-2">
				<label for="income-description" class="text-sm font-medium">Description</label>
				<Textarea
					id="income-description"
					bind:value={description}
					placeholder="What was this income for?"
					rows={2}
				/>
			</div>

			<div class="space-y-2">
				<label for="income-date" class="text-sm font-medium">Date</label>
				<Input id="income-date" type="date" bind:value={date} required />
			</div>
		</form>
		<DialogFooter>
			<Button type="button" variant="outline" onclick={() => onOpenChange(false)}>Cancel</Button>
			<Button type="button" onclick={handleSubmit} disabled={submitting || !amount}>
				{submitting ? 'Creating...' : 'Create Income'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
