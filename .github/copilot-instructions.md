# Project Overview

SvelteKit budget tracking app using Svelte 5, Tailwind CSS, SQLite (better-sqlite3), and Drizzle ORM. Features user authentication, monthly expense tracking, budget planning, and recurring transactions.

## Critical Architecture Patterns

### Authentication Flow

- Session stored in cookies (`event.cookies.get('session')`) with JSON-serialized user data
- `hooks.server.ts` populates `event.locals.user` on every request
- Route protection in `(app)/+layout.server.ts` redirects unauthenticated users to `/auth/sign-in`
- Auth helpers in `$lib/server/auth.ts`: `authenticate()`, `register()` (bcrypt for passwords)

### Database Patterns

- **Audit fields**: All tables have `createdBy`, `updatedBy`, `createdAt`, `updatedAt`
- Use `withAuditFieldsForCreate(data, user)` and `withAuditFieldsForUpdate(data, user)` from `$lib/server/db/utils.ts`
- Foreign keys reference `user.id` for audit fields
- Schema defined in `/src/lib/server/db/schema/` with separate files per table
- Use Drizzle's relational query API: `db.query.transaction.findMany({ with: { category: true, user: true } })`

### Date Filtering Pattern

- Month/year passed via URL params: `?month=12&year=2025`
- Calculate date range: `startDate = YYYY-MM-01`, `endDate = last day of month`
- Filter with: `sql\`date(\${transaction.date}) >= date(\${startDate})\``
- See `dashboard/+page.server.ts` and `finances/transactions/+page.server.ts` for examples

### Form Actions (SvelteKit Pattern)

- Use `export const actions = { create, update, delete }` in `+page.server.ts`
- Check `locals.user` before processing: `if (!locals.user) return fail(401, { error: 'Unauthorized' })`
- For auth forms: use superforms + zod validation (see `auth/sign-in/+page.server.ts`)
- For standard forms: progressive enhancement with `use:enhance` directive

### Component Structure

- UI primitives in `/src/lib/components/ui/` (shadcn-svelte based): Button, Dialog, Table, Select, etc.
- Business components in `/src/lib/components/`: TransactionModal, CategoryDialog, BudgetProgressCard, etc.
- Use `$bindable()` for two-way binding (Svelte 5 runes): `open = $bindable()`
- Toast notifications via `svelte-sonner`: `import { toast } from 'svelte-sonner'`

## Essential Commands

```bash
# Database workflow
npm run db:generate    # Generate migrations from schema changes
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio (GUI)

# Development
npm run dev            # Start dev server (localhost:5173)
npm run check          # Type checking
npm run lint           # Prettier + ESLint
npm test               # Run Vitest unit tests
```

## Code Conventions

- **TypeScript**: Use for all new files with semicolons and single quotes
- **No 'any' types**: Avoid using `any` type entirely - use proper typing, generics, or `unknown` instead
- **Naming**: `snake_case` for DB columns, `camelCase` for TypeScript
- **Styling**: Tailwind classes via `cn()` utility from `$lib/utils.ts`
- **Type imports**: Use `type` keyword: `import type { PageServerLoad } from './$types'`
- **Database types**: Defined in `$lib/types.ts` and `$lib/index.ts`

## Svelte Reactive Patterns (Critical)

### ❌ NEVER Use These Anti-Patterns

1. **EventListener for form submissions**: NEVER use `window.addEventListener('submit', ...)` or DOM event listeners for forms
2. **Unnecessary onMount()**: Avoid `onMount()` unless absolutely required (see below)

**Example of what NOT to do:**

```svelte
// ❌ WRONG - Never do this!
onMount(() => {
  window.addEventListener('submit', () => invalidateAll());
});
```

### ✅ Use SvelteKit's Built-in Patterns

**For forms:** Use `use:enhance` directive (auto-revalidates):

```svelte
<form method="POST" action="?/create" use:enhance>
	<!-- Automatically handles submission and data revalidation -->
</form>
```

**For data updates:** Use load function invalidation:

```svelte
import {invalidateAll} from '$app/navigation'; await invalidateAll(); // After manual API calls
```

**For reactivity:** Use Svelte 5 runes:

- `$state()` for reactive state
- `$derived()` for computed values
- `$effect()` for side effects (replaces most onMount use cases)

### When onMount() IS Acceptable

- Browser-only APIs (canvas, IntersectionObserver, window measurements)
- Third-party library initialization (charts, maps)
- WebSocket/SSE connections

### When onMount() Should NOT Be Used

- Data fetching (use `+page.server.ts` load functions)
- Form handling (use `use:enhance`)
- State initialization (use `$state()`)
- Reacting to changes (use `$effect()` or `$derived()`)

## Route Group Pattern

- `(app)` route group requires authentication via `+layout.server.ts`
- All authenticated pages share layout in `(app)/+layout.svelte`
- Categories loaded once in `(app)/+layout.server.ts` and passed to all child routes

## Environment & Config

- Required env vars: `DATABASE_URL`, `NODE_ENV`, `DB_MIGRATING`, `DB_SEEDING`
- Validated in `src/env.ts` using Zod schema
- Node.js version: **22.13.1** (required for better-sqlite3 compatibility)
