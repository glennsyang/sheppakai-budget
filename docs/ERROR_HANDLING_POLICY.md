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

### Response contract

A form action returns exactly one of three things. There is no fourth shape — in particular, never a
bare `fail(...)` and never an ad-hoc `{ success: true }`.

| Outcome                            | Response                                             | HTTP    |
| ---------------------------------- | ---------------------------------------------------- | ------- |
| Success, navigate away             | `throw redirect(302, '/somewhere')`                  | 302     |
| Success, stay on page              | `message(form, { type: 'success', text })`           | 200     |
| Failure (validation **or** server) | `message(form, { type: 'error', text }, { status })` | 4xx/5xx |

Superforms converts a `message(...)` with a 4xx/5xx status into `fail(status, { form })`, so the
failure case still carries field-level errors — it just also carries a banner. Every failure
therefore has a renderable `App.Superforms.Message` (declared in `src/app.d.ts`), and pages only ever
read `$message` and `$errors`. No page has to branch on which shape the server happened to send.

### Implementations

Both halves live in `src/lib/server/actions/auth-form-handler.ts`:

```typescript
// Validation failure
if (!form.valid) {
	return invalidAuthForm(form);
}

// Server failure: rethrows redirects, logs, maps the Better Auth error to a
// friendly message, and returns the failure banner.
return handleAuthFormAction(
	form,
	async () => {
		await auth.api.signInEmail({ body: { ... }, headers: request.headers });
		throw redirect(302, '/dashboard');
	},
	{
		loggerContext: 'Sign-in failed',
		fallbackMessage: 'An error occurred during sign-in. Please try again.'
	}
);
```

`handleAuthFormAction` defaults to status 400; pass `status` only to override it. Pass
`errorType: 'success'` where a failure must stay indistinguishable from a success (see
`src/routes/auth/forgot-password/+page.server.ts`, which hides whether an account exists).

### Reading the response on the client

Pages hold a `superForm` instance and read `$message` / `$errors`. Inside the `onUpdate` callback,
read `form.message` off the callback argument — **not** the `$message` store. `clearOnSubmit` defaults
to `'message'`, so superforms blanks the store at submit time and only repopulates it after `onUpdate`
has run; a `$message` read inside `onUpdate` is always `undefined`. See
`src/routes/(app)/profile/+page.svelte` for the correct pattern.

Note also that `message(form, ..., { status >= 400 })` sets `form.valid = false`, so `form.valid` is a
usable success check — but prefer `form.message?.type === 'success'`, which is explicit.

Two components submit with plain `use:enhance` from `$app/forms` rather than a `superForm` instance,
because they render no fields of their own: `ConfirmModal` and `PresetBudgetCard`. They read the
banner out of the raw `ActionResult` via `actionMessage()` in `src/lib/utils/actionMessage.ts`, which
is the only place that unwraps a result by hand.

### Migration status

Every action in the app follows this contract. `requireAuth`'s 401 is the sole exception (see below),
and `actionMessage()` keeps its `data.error` fallback for that one case alone.

Success messages for CRUD actions come from `getCrudMessage()` in
`src/lib/server/actions/messages.ts`, so the server owns the wording and pages render
`form.message.text` verbatim rather than duplicating it.

`createDeleteAction` in `src/lib/server/actions/crud-helpers.ts` validates against `idSchema`
(`src/lib/formSchemas/common.ts`) rather than taking a per-caller schema. Every delete in the app
takes an id and nothing else, so one code path covers them all — and a validated form is what lets a
delete answer with a renderable message instead of a bare `fail(...)`. `deleteCustomer` in
`src/routes/(app)/window-cleaning/+page.server.ts` follows the same shape by hand, because it
soft-deletes and so cannot use `deleteAction`.

## Exceptions

- **Auth redirects**: `throw redirect(...)` is intentional control flow, not an error case
- **Validation failures**: Already handled by superforms/zod validation
- **Intentional error throws**: When using `error(404, 'Not found')` is appropriate
- **`requireAuth`'s 401**: `src/lib/server/actions/auth-guard.ts` returns `fail(401, { error })`
  because it runs before any `superValidate` and so has no form to carry a message. It is
  defence-in-depth — `src/routes/(app)/+layout.server.ts` already redirects unauthenticated users, so
  this path is not normally reachable. Contrast `adminAuthFailure`
  (`src/lib/server/actions/admin-guard.ts`), which takes an optional `form` and returns
  `message(form, ...)` when given one.

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

## JSON API routes

`/api/v1/*` routes (`src/routes/api/v1/`) have no superform to attach a `message()` to, so
they follow the same policy restated as a plain JSON envelope instead: `{ data }` on success,
`{ error: { code, message } }` on failure, always with an explicit HTTP status — no third
shape. See `src/lib/server/api/response.ts` (`apiSuccess`/`apiError`) and
[API.md](./API.md) for the full contract.

## References

- Example load implementation: `src/routes/(app)/admin/users/+page.server.ts`
- Example action implementation: `src/routes/auth/sign-in/+page.server.ts`
- Structure review: `docs/structure-review/2026-07-27-review.md` (Error Handling → Findings 1 and 2)
