<script lang="ts">
	import RowActions from '$lib/components/RowActions.svelte';
	import type { Transaction } from '$lib';

	let { id, transactionData }: { id: string; transactionData: Transaction } = $props();
</script>

<RowActions
	{id}
	{transactionData}
	actionUrl="/finances/transactions?/delete"
	deleteMessage="Are you sure you want to delete this transaction?"
/>
