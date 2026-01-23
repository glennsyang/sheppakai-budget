<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { months } from '$lib/utils';
	import { formatLocalTimestamp } from '$lib/utils/dates';

	import type { Category, Transaction } from '$lib';

	interface Props {
		open: boolean;
		transactions: Transaction[];
		category: Category | null | undefined;
		month?: string;
		year?: number;
		footer?: import('svelte').Snippet;
	}

	let { open = $bindable(), transactions, category, month, year, footer }: Props = $props();

	let categoryTotal = $derived(transactions.reduce((sum, t) => sum + t.amount, 0));
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="flex w-full flex-col sm:max-w-lg">
		<Sheet.Header>
			<Sheet.Title>{category?.name} Transactions</Sheet.Title>
			<Sheet.Description>
				Transactions for {month ? months.find((m) => m.value === month)?.label : ''}
				{year || ''}
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex-1 overflow-y-auto px-4 py-4">
			{#if transactions.length === 0}
				<div class="flex h-32 items-center justify-center text-muted-foreground">
					No transactions yet
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Payee</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each transactions as transaction (transaction.id)}
							<Table.Row>
								<Table.Cell>{formatLocalTimestamp(transaction.date)}</Table.Cell>
								<Table.Cell>{transaction.payee}</Table.Cell>
								<Table.Cell class="text-right font-medium">
									${transaction.amount.toLocaleString('en-US', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</div>

		<Sheet.Footer class="border-t pt-4">
			{#if footer}
				{@render footer()}
			{:else}
				<div class="flex w-full justify-between font-semibold">
					<span>
						{transactions.length}
						{transactions.length === 1 ? 'transaction' : 'transactions'}
					</span>
					<span>
						${categoryTotal.toLocaleString('en-US', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}
					</span>
				</div>
			{/if}
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
