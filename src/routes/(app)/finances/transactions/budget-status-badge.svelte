<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		excludedFromBudget: boolean;
	}

	let { excludedFromBudget }: Props = $props();
</script>

{#if excludedFromBudget}
	<Badge
		variant="secondary"
		class="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
	>
		Excluded
	</Badge>
{:else}
	<Badge variant="outline">Included</Badge>
{/if}
