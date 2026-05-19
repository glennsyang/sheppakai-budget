<script lang="ts">
	import type { Transaction } from '$lib';
	import RowActions from '$lib/components/RowActions.svelte';

	let { id, transactionData }: { id: string; transactionData: Transaction } = $props();
</script>

<RowActions
	{id}
	{transactionData}
	actionUrl="/finances/transactions?/delete"
	deleteMessage="Are you sure you want to delete this transaction?"
/>
