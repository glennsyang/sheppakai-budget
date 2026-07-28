# Server Load Error Handling Policy

## Overview

All SvelteKit server load functions and actions must implement consistent error handling to ensure:

- **Operational visibility**: Errors are logged with sufficient context for debugging
- **Graceful degradation**: Users see helpful error messages instead of generic 500 pages
- **Consistent UX**: All routes handle failures in a predictable way

## Policy: Load Functions

### Required Pattern

All `load` functions that make database queries or external API calls **must** wrap them in try/catch blocks:

```typescript
export const load: PageServerLoad = async ({ url, locals }) => {
	// Initialize forms first (outside try/catch since they're synchronous)
	const form = await superValidate(zod4(mySchema));

	try {
		// Database queries or external API calls
		const data = await queries.findAll();

		return {
			data,
			form
		};
	} catch (error) {
		logger.error('Failed to load [entity name]:', error);
		return {
			data: [], // sensible empty default
			loadError: 'Failed to load [entity name]. Please try refreshing the page.',
			form
		};
	}
};
```

### Key Requirements

1. **Log all errors**: Use `logger.error()` with descriptive context
2. **Return typed fallback**: Return all expected properties with safe defaults
3. **Include loadError field**: Add optional `loadError: string` to communicate failure to UI
4. **Safe defaults**: Empty arrays for lists, empty objects for maps, null for optional single values
5. **Preserve forms**: Always return form objects initialized before the try block

### Example: Multiple Queries

```typescript
export const load: PageServerLoad = async ({ url }) => {
	const { startDate, endDate } = getMonthRangeFromUrl(url);
	const form = await superValidate(zod4(transactionSchema));

	try {
		const [transactions, budgets] = await Promise.all([
			transactionQueries.findByDateRange(startDate, endDate),
			budgetQueries.findByMonthYear(month, year)
		]);

		return {
			transactions,
			budgets,
			form
		};
	} catch (error) {
		logger.error('Failed to load transactions and budgets:', error);
		return {
			transactions: [],
			budgets: [],
			loadError: 'Failed to load transaction data. Please try refreshing the page.',
			form
		};
	}
};
```

## Policy: Actions

Actions already have consistent error handling via `createCrudActions` helper or explicit try/catch blocks. The pattern is:

```typescript
try {
	// Perform action
	await someAction();
	logger.info('Action completed successfully', { context });
	return { success: true, form };
} catch (error) {
	logger.error('Action failed:', error);
	return message(
		form,
		{
			type: 'error',
			text: 'Friendly error message for user'
		},
		{ status: 500 }
	);
}
```

## Exceptions

- **Auth redirects**: `throw redirect(...)` is intentional control flow, not an error case
- **Validation failures**: Already handled by superforms/zod validation
- **Intentional error throws**: When using `error(404, 'Not found')` is appropriate

## Frontend Integration

Components should check for `loadError` and display it prominently:

```svelte
<script lang="ts">
	let { data } = $props();
</script>

{#if data.loadError}
	<Alert variant="destructive">
		<AlertTitle>Error</AlertTitle>
		<AlertDescription>{data.loadError}</AlertDescription>
	</Alert>
{/if}
```

## References

- Example implementation: `src/routes/(app)/admin/users/+page.server.ts`
- Structure review: `docs/structure-review/2026-07-27-review.md` (Finding: Error Handling → Finding 1)
