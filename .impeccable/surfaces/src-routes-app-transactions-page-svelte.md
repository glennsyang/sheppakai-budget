---
version: 1
slug: 'src-routes-app-transactions-page-svelte'
primary_target: 'src/routes/(app)/transactions/+page.svelte'
related_targets:
  ['src/lib/components/ui/data-table/data-table.svelte', 'src/lib/components/PageShell.svelte']
---

# App routes (Quiet Ledger composition pass, every route but /dashboard)

Mode: Operate (auth + landing: Operate-adjacent entry surfaces, kept calm). Scope: all authenticated routes, admin, profile, auth, landing. World: inherited from DESIGN.md (Quiet Ledger), not replaced.

Audience and job: the household on a phone (log, check, scan a list) and at a desk (review, bookkeeping). User pain: tables unreadable on phones; pages still look like the pre-redesign app.

Constraints: keep all behavior, forms, actions, copy meaning; shadcn/bits-ui primitives re-themed; nonce CSP; light + dark parity.

## Direction contract

THESIS: Every route reads like the dashboard: one header, one stat strip carrying the page's answer figures, one panel holding the ledger. Refuses the incumbent stack of centered "Monthly Summary" boxes beside a bordered table.

OWN-WORLD: DESIGN.md Quiet Ledger: cool near-neutral greys, indigo for action/selection only, money colours for state only, category hues as 8px dots, Inter tabular figures, 16px panels, hairline rows.

STORY: Open a page, read its totals in the strip, scan rows (phone: stacked ledger rows grouped by date; desk: hairline table), tap a row or the one primary action.

FIRST VIEWPORT: Headline title + muted subtitle left; period picker and one primary action right (stacked on phone). Stat strip panel. Then the ledger panel (toolbar, rows, pager). Side panel only where it carries distinct info (budget by category).

FORM: category standard (canon) inherited from the dashboard; extension of an established world, no concept roll. Signature: DataTable's phone ledger mode (title/detail/value roles from column meta, date-grouped). Dialogs become bottom sheets on phones for fast capture.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
