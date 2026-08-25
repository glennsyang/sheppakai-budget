# Sheppakai Budget — Claude Code Guide

A personal finance tracker: transactions, category budgets, recurring transactions, savings goals, income, receipts (fuel + business), and a side "window-cleaning" business tracker, all under one auth'd app.

---

## Tech Stack

| Concern    | Choice                                                       |
| ---------- | ------------------------------------------------------------ |
| Framework  | SvelteKit + TypeScript                                       |
| Database   | SQLite via Drizzle ORM (`better-sqlite3`)                    |
| Auth       | better-auth v1 + `@better-auth/api-key` + `admin` plugin     |
| UI         | shadcn-svelte (bits-ui) + Tailwind CSS v4                    |
| Charts     | `layerchart` + `d3-scale`/`d3-shape` (not a table-chart lib) |
| Data table | `@tanstack/svelte-table`                                     |
| Forms      | sveltekit-superforms v2 + Zod v4                             |
| Errors     | Sentry (`@sentry/sveltekit`)                                 |
| Testing    | Vitest (48 test files — this repo is actually well-tested)   |
| Linting    | oxlint + oxfmt, plus custom static checks (see below)        |
| Deployment | fly.io, region `yyz`, SQLite on a persistent volume          |

---

## Non-Negotiable Conventions

- **Never use `console.log`** — import `logger` from `$lib/server/logger`.
- Imports use `$lib/components/ui/...` directly — no custom path alias (`$comp` etc. does not exist in this repo).
- Class merging: prefer Svelte's array `class={[...]}` syntax; `tailwind-merge`/`tailwind-variants` are deps but only for the shadcn component internals, not general app code.
- Re-throw SvelteKit redirects in auth/action catch blocks: `if (isRedirect(err)) throw err`.

### Env vars — uses SvelteKit's newer `$app/env` module, not `$app/environment`

This repo is on a SvelteKit version where `building`/`dev` come from **`$app/env`** (see `src/hooks.server.ts`), and private runtime env vars come from **`$app/env/private`** (see `src/lib/server/auth.ts` — `BETTER_AUTH_SECRET`, `ADMIN_USER_IDS`, etc.), not the older `$app/environment` / `$env/dynamic/private` pattern most SvelteKit docs/examples still show. Don't "fix" imports to the old modules.

### Static checks beyond oxlint (`npm run lint:static`)

- `check:dead-exports`, `check:redirect-throws`, `check:no-explicit-any` — custom scripts in `scripts/`
- `check:dead-code` — via `fallow dead-code`
- Run `npm run check:all` (fmt + lint + test) before considering a change done.

---

## The CRUD Pattern (read before adding a new list/entity feature)

This repo already has a shared helper for the repeated "list page + form + server actions" shape — **don't hand-roll it**:

- **`createCrudActions()`** in `src/lib/server/actions/crud-helpers.ts` — generic create/update/delete actions given a Zod schema, a Drizzle table, an entity name, and optional `transformCreate`/`transformUpdate` hooks. Handles superforms validation, audit fields (`withAuditFieldsForCreate/Update`), and consistent success/error messages (`CrudMessages`).
- **Query objects** per domain in `src/lib/server/db/queries` (e.g. `transactionQueries`, `budgetQueries`) — encapsulate the Drizzle queries for that entity (`findByDateRange`, `search`, etc.) rather than querying inline in `+page.server.ts`.
- **Schemas** live in `src/lib/formSchemas/<domain>.ts`, re-exported via `src/lib/formSchemas/index.ts`.
- This shape repeats across `transactions`, `categories`, `recurring`, `savings`, `income`, `budget`, `receipts/*`, `window-cleaning`, and the `admin` routes. When adding a new one, follow an existing route (e.g. `transactions/+page.server.ts`) rather than inventing a new shape.

---

## Auth

- `src/lib/server/auth.ts` — better-auth with `drizzleAdapter`, `admin` plugin, `apiKey` plugin (`@better-auth/api-key` — there's a real API surface under `src/routes/api/v1`, protected by API keys, separate from session auth).
- Min password length 12, session revoked on password reset, password reset tokens expire in 10 minutes.
- `ADMIN_USER_IDS` env var gates the `admin` plugin's elevated role — check `src/lib/server/auth.ts` before assuming any user can hit `(app)/admin`.
- Auth-adjacent helpers: `src/lib/server/actions/auth-guard.ts` (`requireAuth`), `src/lib/server/auth-guard-load.ts` for `+layout.server.ts` guards, `src/lib/server/cron-auth.ts` for the `api/cron` routes (separate auth path, not session-based).

---

## Domain notes

- **`window-cleaning`** and **`receipts` (fuel + business)** are real side-business bookkeeping features, not demo data — treat them as first-class, not throwaway.
- **Sentry** is wired in `hooks.server.ts` with a hardcoded DSN and `handleErrorWithSentry()` — don't strip this thinking it's leftover boilerplate.
- CSP is nonce-based (`svelte.config.js`, `kit.csp.mode: 'nonce'`) with specific `unsafe-inline` carve-outs for `layerchart`/bits-ui runtime style injection — read the comments there before touching CSP, the directives are deliberate, not defaults.

---

## Commands

```bash
npm run dev            # Dev server
npm run check:all       # fmt + lint + test — run before calling a change done
npm run test:unit       # Vitest, watch mode by default (add --run for CI mode)
npm run test:coverage
npm run db:generate     # drizzle-kit generate (new migration)
npm run db:migrate
npm run db:studio
```

---

## Shared toolkit

This repo shares skills/agents/commands with `meal-planner` and `synapse` via the `sveltekit-toolkit` Claude Code plugin (see `../claude-sveltekit-toolkit`), enabled in `.claude/settings.json`. It provides `svelte-code-writer`, `svelte5-best-practices`, `better-auth-best-practices`, `shadcn-svelte-components`, `frontend-design`, `tailwind-patterns`, `web-design-reviewer`, a `/propagate` command for replicating a shared-dependency fix across the sibling repos, and a `/scaffold-form` command for scaffolding a new form/CRUD feature — this repo's flavor is the CRUD-list pattern above, so point it at an existing route like `transactions/+page.server.ts` as the exemplar.

The `code-structure-reviewer` and `security-reviewer` agents (also from the shared plugin) are available on demand — invoke them when you want a structural or security pass on a change, not automatically on every PR.
