# Sentry Wiring Strategy

Single source of truth for how Sentry is wired into `hooks.server.ts` /
`hooks.client.ts` across the three auth apps (`synapse`, `sheppakai-budget`,
`sheppakai-mealplanner`). Tracked by
[glennsyang/sheppakai-budget#441](https://github.com/glennsyang/sheppakai-budget/issues/441);
see `auth-audit.md` §2.

## `sentryHandle()` — used in all three

`hooks.server.ts` wires `Sentry.sentryHandle()` first in the `handle` sequence:

```ts
export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	// ...app handle logic
});
```

All three apps already set `tracesSampleRate: 1.0` in their server `Sentry.init`, and
`sentryHandle()` is what actually turns that into per-request tracing spans and
distributed-trace header propagation server-side; it also lets Sentry read the same
per-request CSP nonce SvelteKit generates (see `docs/CSP.md`). Without it, the
`tracesSampleRate` setting is inert.

## `handleError` — never wrapped with `handleErrorWithSentry()` server-side

Every app's `src/lib/server/logger.ts` already forwards unhandled errors to Sentry:
`logger.error()` calls `Sentry.captureException()` (or `captureMessage()` for non-`Error`
values) internally whenever it's invoked outside dev. `hooks.server.ts`'s `handleError`
calls `logger.error('Unhandled server error', ...)` on every unhandled error, so wrapping
`handleError` itself with `Sentry.handleErrorWithSentry()` would double-report every one
of them. Each `hooks.server.ts` documents this with a comment directly above `handleError`.

**Client-side is different and unaffected**: `hooks.client.ts` in all three apps uses
`export const handleError = handleErrorWithSentry();` — there is no structured logger
running in the browser to cause double-reporting, so this is the correct, unchanged
pattern client-side.

## `Sentry.init` options

Budget and synapse are on SDK v11. Mealplanner is still on v10 (`sendDefaultPii: false`, `enableLogs: true`) until it gets the same upgrade.

| option             | client                 | server                 | why                                                                                                                                                                                                                                                                                              |
| ------------------ | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dsn`              | app's public DSN       | app's public DSN       |                                                                                                                                                                                                                                                                                                  |
| `tracesSampleRate` | `0.2`                  | `1.0`                  | paired with `sentryHandle()` server-side (see above)                                                                                                                                                                                                                                             |
| `dataCollection`   | `sentryDataCollection` | `sentryDataCollection` | v11 replaced `sendDefaultPii` with this, and **leaving it unset collects everything** (cookies, bodies, user info, IPs), including the Better Auth session cookie server-side. `src/lib/sentry-data-collection.ts` pins the v10-equivalent baseline; requestId is the only prod correlation key. |
| `attachStacktrace` | default                | `false`                | `logger.warn`/`logger.error` report via `captureMessage`; v11 would otherwise attach a synthetic call-site stack trace and regroup existing issues.                                                                                                                                              |

`enableLogs` is not set: nothing uses `Sentry.logger`. Each `Sentry.init({...})` call documents the
`dataCollection` choice inline, so nobody drops it when copy-pasting config between hooks.

## Changing this strategy

1. Update `hooks.server.ts` / `hooks.client.ts` in the affected repo(s).
2. Update this file so it stays the single source of truth.
3. Verify: `npm run check:all`, then a manual smoke check (`npm run dev`, load a page,
   confirm no Sentry init errors in the console and that request logging still works).
