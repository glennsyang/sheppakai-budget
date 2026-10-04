<script lang="ts">
	import { enhance as enhanceAction } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { formatCurrency } from '$lib/utils';
	import { actionMessage } from '$lib/utils/actionMessage';
	import { padMonth } from '$lib/utils/dates';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';

	interface Props {
		title: string;
		amount: number;
		isSelected: boolean;
		presetType: 'lastMonth' | 'lastMonthBudget' | 'average' | 'custom';
		isCustom?: boolean;
		isEditing?: boolean;
		editAmount?: string;
		budgetId?: string | null;
		selectedMonth: number;
		selectedYear: number;
		categoryId: string;
		onSelect: () => void;
		onEdit?: () => void;
		onCancel?: () => void;
		onSaved?: () => void;
	}

	let {
		title,
		amount,
		isSelected,
		presetType,
		isCustom = false,
		isEditing = false,
		editAmount = '',
		budgetId = null,
		selectedMonth,
		selectedYear,
		categoryId,
		onSelect,
		onEdit,
		onCancel,
		onSaved
	}: Props = $props();

	// These cards render no form fields of their own (everything is hidden inputs), so they submit
	// with plain enhance and read the server's banner out of the result rather than holding a
	// superForm instance. Shapes come from docs/ERROR_HANDLING_POLICY.md.
	const enhanceBudget: SubmitFunction =
		() =>
		async ({ result, update }) => {
			const { type, text } = actionMessage(result, {
				success: 'Budget saved successfully',
				error: 'Failed to save budget.'
			});

			if (type === 'success') {
				onSaved?.();
			}

			toast[type](text);

			await update();
		};
</script>

{#snippet radio()}
	<span
		class={[
			'flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
			isSelected ? 'border-primary bg-primary' : 'border-input bg-transparent'
		]}
		aria-hidden="true"
	>
		{#if isSelected}<span class="bg-primary-foreground size-1.5 rounded-full"></span>{/if}
	</span>
{/snippet}

{#if isCustom}
	{#if isEditing}
		<form
			method="POST"
			action={budgetId ? '?/update' : '?/create'}
			use:enhanceAction={enhanceBudget}
			class="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
		>
			{@render radio()}
			{#if budgetId}
				<input type="hidden" name="id" value={budgetId} />
			{/if}
			<input type="hidden" name="month" value={padMonth(selectedMonth.toString())} />
			<input type="hidden" name="year" value={selectedYear.toString()} />
			<input type="hidden" name="categoryId" value={categoryId} />
			<input type="hidden" name="presetType" value={presetType} />
			<label for="custom-budget-amount" class="text-sm font-medium">{title}</label>
			<div class="ms-auto flex items-center gap-2">
				<Input
					id="custom-budget-amount"
					type="number"
					inputmode="decimal"
					name="amount"
					value={editAmount}
					step="0.01"
					min="0"
					class="w-32 text-right tabular-nums"
					autofocus
				/>
				<Button type="submit" size="sm">Save</Button>
				<Button type="button" size="sm" variant="ghost" onclick={onCancel}>Cancel</Button>
			</div>
		</form>
	{:else}
		<button
			type="button"
			aria-pressed={isSelected}
			class="hover:bg-muted/60 focus-visible:bg-muted/60 flex w-full items-center gap-3 px-4 py-3 text-left outline-none sm:px-5"
			onclick={() => {
				onSelect();
				onEdit?.();
			}}
		>
			{@render radio()}
			<span class="flex-1 text-sm font-medium">{title}</span>
			<span class={['text-sm tabular-nums', isSelected ? 'font-medium' : 'text-muted-foreground']}>
				{isSelected && amount > 0 ? formatCurrency(amount) : 'Enter amount'}
			</span>
		</button>
	{/if}
{:else}
	<form method="POST" action={budgetId ? '?/update' : '?/create'} use:enhanceAction={enhanceBudget}>
		{#if budgetId}
			<input type="hidden" name="id" value={budgetId} />
		{/if}
		<input type="hidden" name="month" value={padMonth(selectedMonth.toString())} />
		<input type="hidden" name="year" value={selectedYear.toString()} />
		<input type="hidden" name="categoryId" value={categoryId} />
		<input type="hidden" name="amount" value={amount.toFixed(2)} />
		<input type="hidden" name="presetType" value={presetType} />
		<button
			type="submit"
			aria-pressed={isSelected}
			class="hover:bg-muted/60 focus-visible:bg-muted/60 flex w-full items-center gap-3 px-4 py-3 text-left outline-none sm:px-5"
			onclick={(e) => {
				e.preventDefault();
				onSelect();
				(e.currentTarget.closest('form') as HTMLFormElement)?.requestSubmit();
			}}
		>
			{@render radio()}
			<span class="flex-1 text-sm font-medium">{title}</span>
			<span class={['text-sm tabular-nums', isSelected ? 'font-medium' : 'text-muted-foreground']}>
				{formatCurrency(amount)}
			</span>
		</button>
	</form>
{/if}
