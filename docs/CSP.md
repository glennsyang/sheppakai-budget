# Content-Security-Policy Strategy

Single source of truth for how CSP is configured across the three auth apps
(`synapse`, `sheppakai-budget`, `sheppakai-mealplanner`). Tracked by
[glennsyang/sheppakai-budget#440](https://github.com/glennsyang/sheppakai-budget/issues/440);
see `auth-audit.md` §2I.

## Strategy — SvelteKit `kit.csp` nonce mode

All three apps configure CSP **only** through `kit.csp` with `mode: 'nonce'` in
`svelte.config.js`:

```js
kit: {
	csp: {
		mode: 'nonce',
		directives: { /* see table below */ }
	}
}
```

SvelteKit generates a per-request nonce, injects it into every inline `<script>` /
`<style>` it emits during SSR, and sets the `Content-Security-Policy` response header
itself. Sentry's `sentryHandle()` (where used) reads the same nonce.

`hooks.server.ts` **must never set `Content-Security-Policy`** — doing so overrides the
nonce-bearing header SvelteKit emits. The other security headers (`X-Frame-Options`,
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, `X-Request-ID`)
stay in `hooks.server.ts`.

> Historical note: `synapse` previously hand-built CSP in `hooks.server.ts` — a
> per-request nonce plus a `transformPageChunk` pass that rewrote every `<script>` tag,
> and a manually assembled header. That approach was replaced with `kit.csp` nonce mode
> for #440. Do not reintroduce it.

## `script-src` — `'self'` only

No `unsafe-eval`, no `unsafe-inline`. The SvelteKit nonce covers SvelteKit's own inline
scripts; the app ships no other inline scripts.

- **`layerchart` (2.x) / `d3-scale` / `d3-shape` do not use `Function()` or `eval()`.**
  `synapse` and `budget` both render layerchart charts under `script-src 'self'` with no
  `unsafe-eval`. `mealplanner` has no charts at all (no `layerchart`/`d3-*` dependency) —
  its former `script-src 'unsafe-eval'` was stale copy-paste and was removed for #440.
- **The `sveltekit-superforms` → `arktype` (`@ark/util`) CSP probe is expected to be
  blocked.** On first import it runs `new Function("return false")()` once; CSP blocks it
  (by design), the library catches the error and falls back to its jitless path for the
  session. The resulting console warning is benign. **Do not add `unsafe-eval` to silence
  it.**

## `style-src` — `unsafe-inline` retained

Chart libraries (`layerchart`) inject `<style>` elements at runtime _after_ SSR, where no
nonce is available; `bits-ui` and chart colour vars set runtime-computed CSS custom
properties via `style="…"` attributes that cannot be hashed ahead of time. So:

- `style-src-elem`: `'self' 'unsafe-inline'`
- `style-src-attr`: `'unsafe-inline'`

`budget` splits these two directives out explicitly; `synapse`/`mealplanner` may use a
single `style-src 'self' 'unsafe-inline'` — equivalent for our purposes.

## Known limitation — `mode-watcher` FOUC script

`<ModeWatcher>` (from `mode-watcher`) injects an inline `<script>` into `<svelte:head>`
via `{@html}` to set the theme class before first paint. SvelteKit's nonce mode only
nonces the inline `<script>`/`<style>` **it** generates, not `{@html}` output, so this one
script is blocked by `script-src 'self' 'nonce-…'` (a `Refused to execute inline script`
console entry on every page load). `<ModeWatcher>`'s `onMount` still applies the correct
theme after hydration — the only visible effect is a possible brief flash of the wrong
theme on a cold load. This is identical across `budget` and `synapse` (both ship
`<ModeWatcher />` unchanged) and is accepted for #440. If the flash becomes a problem,
fix it in all repos at once — pass `mode-watcher`'s `nonce` prop (needs the request nonce
threaded through) or `disableHeadScriptInjection`.

## Canonical directive set

| directive                                                   | baseline (all three)                                                    | `synapse` adds                                                      | why                                                                             |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `default-src`                                               | `'self'`                                                                | —                                                                   |                                                                                 |
| `script-src`                                                | `'self'`                                                                | —                                                                   | nonce added automatically by `kit.csp`                                          |
| `style-src-elem` / `style-src`                              | `'self' 'unsafe-inline'`                                                | `https://fonts.googleapis.com`                                      | runtime `<style>` injection; synapse loads Google Fonts CSS                     |
| `style-src-attr`                                            | `'unsafe-inline'`                                                       | —                                                                   | runtime-computed CSS custom properties                                          |
| `img-src`                                                   | `'self' data: https:`                                                   | —                                                                   |                                                                                 |
| `font-src`                                                  | `'self'`                                                                | `https://fonts.gstatic.com`                                         | synapse loads Google Fonts                                                      |
| `connect-src`                                               | `'self'`, `https://*.ingest.us.sentry.io`, `https://*.ingest.sentry.io` | `https://nominatim.openstreetmap.org`, `https://api.open-meteo.com` | Sentry client transport; synapse geocoding + weather                            |
| `frame-ancestors`                                           | `'none'`                                                                | —                                                                   |                                                                                 |
| `object-src`                                                | `'none'`                                                                | —                                                                   |                                                                                 |
| `base-uri`                                                  | `'self'`                                                                | —                                                                   |                                                                                 |
| `manifest-src` / `worker-src` / `frame-src` / `form-action` | _(budget/mealplanner: not set — inherit `default-src`)_                 | `'self'` / `'self'` / `'none'` / `'self'`                           | synapse sets them explicitly; budget/mealplanner may adopt later — non-blocking |

### Per-app `connect-src`

| app                     | `connect-src`                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| `synapse`               | `'self'` · Sentry ingest · `https://nominatim.openstreetmap.org` · `https://api.open-meteo.com` |
| `sheppakai-budget`      | `'self'` · Sentry ingest                                                                        |
| `sheppakai-mealplanner` | `'self'` · Sentry ingest                                                                        |

"Sentry ingest" = `https://*.ingest.us.sentry.io` and `https://*.ingest.sentry.io`.

## Changing CSP

1. Update `svelte.config.js` in the affected repo(s).
2. Update the table above so this file stays the single source of truth.
3. Verify with `npm run build && npm run preview`: load an authenticated page (a
   chart page where the app has charts), confirm the `Content-Security-Policy` response
   header carries a fresh `'nonce-…'` in `script-src`, and confirm the browser console
   shows **no** CSP violations.
