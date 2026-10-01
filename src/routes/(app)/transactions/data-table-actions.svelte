<script lang="ts">
	import type { Transaction } from '$lib';
	import TransactionRowActions from '$lib/components/TransactionRowActions.svelte';

	let { id, transactionData }: { id: string; transactionData: Transaction } = $props();
</script>

<TransactionRowActions
	{id}
	{transactionData}
	actionUrl="/transactions?/delete"
	deleteMessage="Are you sure you want to delete this transaction?"
/>
