---
version: 1
slug: 'src-routes-app-dashboard-page-svelte'
primary_target: 'src/routes/(app)/dashboard/+page.svelte'
related_targets: ['src/routes/(app)/+layout.svelte', 'src/app.css']
---

# Dashboard (app world redesign, proven here first)

Mode: Operate. Scope: the authenticated app world (tokens, shell, primitives) proven on `/dashboard`; other routes inherit through tokens and get composition passes later.

Audience and job: the household, daily on a phone (is today OK to spend?) and weekly at a desk (where did the month go?). Task: read Safe to Spend, see pace vs budget, find the category that is slipping, log an expense in one tap. Constraints: light + dark parity, shadcn/bits-ui primitives kept and re-themed, nonce CSP (fonts self-hosted), not playful, not dense.

Chosen direction: the category standard (canon), benchmarked to Copilot Money and Linear craft. Memorable moment: the spend-pace chart under Safe to Spend.

Unresolved: composition passes for transactions, budget, receipts, window-cleaning routes.

## Direction contract

THESIS: A modern personal-finance app at Copilot/Linear finish: one calm surface, one figure that answers "can I spend today?", and the month's pace drawn honestly beneath it. Refuses the incumbent wall of same-size KPI cards, spinning beams and sparklines.

OWN-WORLD: Near-neutral cool greys; light page oklch(0.985) with white panels, dark page near-black oklch(0.16) with lifted panels (Linear). One indigo accent for action and selection only. Money green/red/amber reserved for money state. Category palette of eight even-lightness hues as dots and bars. Inter Variable (opsz) with tabular figures; 16px panel radius, 10px controls, 1px hairlines, soft offset shadows in light, none in dark.

STORY: The household opens the app, reads today's safe-to-spend in under a second, sees whether spending is ahead of or behind budget pace, taps the category that's slipping, or logs an expense.

FIRST VIEWPORT: Compact header: "Hi, {name}" with days-left subtitle at left; period segmented control, month select and primary "Log expense" at right. Then one full-width panel: left column Safe to Spend Today at 56px tabular, "/day", one line "$X left over N days", then Income / Spent / Net as three inline figures; right column (stacked below on phone) the cumulative spend-pace chart: actual spend line vs budget pace line, today marker. Below: one stat strip panel (Linear-style divided cells) for the remaining KPIs, then category list rows.

FORM: category standard (canon), not on the ordered list; seed key 9d841760. Signature interaction: hovering/scrubbing the pace chart reads out day, spent to date, pace to date. Motion: 150–200ms state transitions, bar fills ease-out once on load, nothing else.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
