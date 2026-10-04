---
name: Sheppakai Budget
description: Household finances and side-business bookkeeping on one calm surface, with the answer first and the month's pace drawn honestly beneath it.
colors:
  page-grey: 'oklch(0.985 0.003 264)'
  panel-white: 'oklch(1 0 0)'
  shell-grey: 'oklch(0.958 0.005 264)'
  ink: 'oklch(0.205 0.012 264)'
  muted-ink: 'oklch(0.515 0.016 264)'
  quiet-fill: 'oklch(0.957 0.005 264)'
  hairline: 'oklch(0.918 0.005 264)'
  input-stroke: 'oklch(0.882 0.007 264)'
  track: 'oklch(0.935 0.005 264)'
  shell-hover: 'oklch(0.925 0.007 264)'
  action-indigo: 'oklch(0.51 0.2 270)'
  on-indigo: 'oklch(0.99 0.004 270)'
  indigo-tint: 'oklch(0.95 0.012 270)'
  focus-indigo: 'oklch(0.6 0.17 270)'
  money-green: 'oklch(0.545 0.135 156)'
  money-amber: 'oklch(0.6 0.14 62)'
  money-red: 'oklch(0.575 0.215 26)'
  series-1: 'oklch(0.62 0.13 240)'
  series-2: 'oklch(0.66 0.12 220)'
  series-3: 'oklch(0.66 0.11 185)'
  series-4: 'oklch(0.63 0.16 310)'
  series-5: 'oklch(0.68 0.15 50)'
  series-6: 'oklch(0.65 0.15 350)'
  series-7: 'oklch(0.72 0.12 95)'
  series-8: 'oklch(0.58 0.06 250)'
typography:
  display:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '3.5rem'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '-0.035em'
    fontFeature: "'tnum', 'cv11', 'ss03'"
    fontVariation: "'opsz' auto"
  display-phone:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '2.75rem'
    fontWeight: 600
    lineHeight: 1
    letterSpacing: '-0.035em'
    fontFeature: "'tnum', 'cv11', 'ss03'"
    fontVariation: "'opsz' auto"
  headline:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.75rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '-0.025em'
  title:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: '-0.025em'
  figure:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.25rem'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '-0.025em'
    fontFeature: "'tnum', 'cv11', 'ss03'"
  body:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "'cv11', 'ss03'"
  label:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.33
  axis:
    fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.6875rem'
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "'tnum'"
rounded:
  sm: '8px'
  md: '10px'
  lg: '12px'
  xl: '16px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '20px'
  '6': '24px'
  '8': '32px'
components:
  button-primary:
    backgroundColor: '{colors.action-indigo}'
    textColor: '{colors.on-indigo}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline:
    backgroundColor: '{colors.page-grey}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline-hover:
    backgroundColor: '{colors.indigo-tint}'
  input:
    backgroundColor: '{colors.page-grey}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
  segmented-control:
    backgroundColor: '{colors.quiet-fill}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '3px'
    height: '36px'
  segmented-control-active:
    backgroundColor: '{colors.page-grey}'
    rounded: '{rounded.md}'
  panel:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
  stat-cell:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    typography: '{typography.figure}'
    padding: '20px'
  category-row:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '12px 20px'
  category-row-hover:
    backgroundColor: '{colors.quiet-fill}'
  meter:
    backgroundColor: '{colors.track}'
    rounded: '{rounded.full}'
    height: '6px'
  nav-item:
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px'
    height: '32px'
  nav-item-active:
    backgroundColor: '{colors.shell-hover}'
    textColor: '{colors.ink}'
  page-header:
    textColor: '{colors.ink}'
    typography: '{typography.headline}'
  period-picker:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    height: '36px'
  period-picker-phone:
    height: '44px'
  ledger-panel:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
  ledger-table-header:
    textColor: '{colors.muted-ink}'
    typography: '{typography.label}'
    padding: '0 12px'
    height: '40px'
  ledger-table-row:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '8px 12px'
    height: '48px'
  ledger-table-row-hover:
    backgroundColor: '{colors.quiet-fill}'
  ledger-row-phone:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '10px 8px 10px 16px'
    height: '56px'
  ledger-group-heading:
    backgroundColor: '{colors.quiet-fill}'
    textColor: '{colors.muted-ink}'
    typography: '{typography.label}'
    padding: '6px 16px'
  status-badge:
    backgroundColor: '{colors.quiet-fill}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '0 6px'
    height: '20px'
  status-badge-positive:
    textColor: '{colors.money-green}'
  status-badge-negative:
    textColor: '{colors.money-red}'
  status-badge-muted:
    textColor: '{colors.muted-ink}'
  tag-chip:
    textColor: '{colors.muted-ink}'
    typography: '{typography.axis}'
    rounded: '{rounded.md}'
    padding: '2px 6px'
  dialog:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
    width: '512px'
  dialog-sheet:
    backgroundColor: '{colors.panel-white}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
    padding: '20px'
    width: '100%'
  dialog-title:
    textColor: '{colors.ink}'
    typography: '{typography.title}'
  goal-row:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '16px 20px'
  goal-meter:
    backgroundColor: '{colors.track}'
    rounded: '{rounded.full}'
    height: '6px'
  goal-meter-fill:
    backgroundColor: '{colors.money-green}'
  choice-row:
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    padding: '12px 20px'
  choice-radio-selected:
    backgroundColor: '{colors.action-indigo}'
    rounded: '{rounded.full}'
    size: '16px'
  paid-toggle:
    rounded: '{rounded.full}'
    size: '20px'
  paid-toggle-on:
    backgroundColor: '{colors.action-indigo}'
    textColor: '{colors.on-indigo}'
  tab-nav-item:
    textColor: '{colors.muted-ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '0 12px'
    height: '30px'
  tab-nav-item-active:
    backgroundColor: '{colors.page-grey}'
    textColor: '{colors.ink}'
  form-message:
    backgroundColor: '{colors.quiet-fill}'
    textColor: '{colors.ink}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '10px 12px'
---

# Design System: Sheppakai Budget

<!-- Recorded from the shipped build: src/app.css, the (app) shell and the dashboard (branch redesign-app-world), then every other route (branch redesign-all-routes: transactions, budget, income, recurring, savings, receipts, window-cleaning, categories, profile, admin, auth and the landing page). Light values are in the frontmatter; dark values live in the sidecar (.impeccable/design.json, colorMeta.*.dark). -->

## Overview

**Creative North Star: "The Quiet Ledger"**

A modern personal-finance app finished to Copilot Money / Linear standard: one calm, near-neutral surface where the single figure that answers "can I spend today?" sits first and the month's pace is drawn honestly beneath it. Colour is rationed by job. Indigo means "you can act here". Green, amber and red mean money state and nothing else. A set of even-lightness hues names categories. All other data ink is the foreground colour.

Density is moderate. Panels hold real content, rows breathe at 12px vertical padding, and figures carry the hierarchy through size and tabular alignment, not boxes or colour. The app shell is a recessed grey sidebar with the content inset as one raised sheet. In light mode depth is soft, low offset shadow. In dark mode it is tonal lift with no shadow at all.

The world was built to replace a wall of same-size KPI cards, spinning beams and sparklines. The answer comes once, at the top, at a size that reads in under a second.

Every other route reads like the dashboard: one header with a muted subtitle, one stat strip carrying the page's answer figures, then one panel holding the ledger. On a phone the ledger becomes stacked rows grouped under date headings and capture dialogs rise as bottom sheets; at the desk it is a hairline table.

**Key Characteristics:**

- Cool near-neutral greys (hue 264-270, chroma at or below 0.016) carry nearly every pixel.
- One indigo accent, reserved for action, selection, focus and the today marker.
- Money colours encode money state only. Category hues identify categories only. The two never share a hue band.
- Inter Variable with optical sizing, `cv11` + `ss03`, and tabular figures on every amount.
- 16px panels, 10px controls, 1px hairlines; soft shadow in light, none in dark.
- Motion is limited to state transitions (150ms) and one ease-out bar fill on load (500ms).
- Every route is header, stat strip, ledger panel: stacked date-grouped rows below `md`, a hairline table from `md`.

## Colors

A cool, almost-colourless ledger with one indigo voice and a strictly rationed money vocabulary.

### Primary

- **Action Indigo** (action-indigo): the primary button ("Log expense"), active nav icon, inline links ("Set one"), the today/last-day dot on the pace chart, caret colour, the 22% text-selection tint, the selected radio in a choice list, the paid toggle when on, and the brand mark tile. Dark mode lifts it to `oklch(0.6 0.19 272)`.
- **Indigo Tint** (indigo-tint): hover fill for outline buttons and menu items. The only place indigo appears as a surface.
- **Focus Indigo** (focus-indigo): focus rings, drawn as a 3px ring at 50% alpha.

### Secondary (money state)

- **Money Green** (money-green): under budget, positive net, "Stayed on track", goal progress fills and savings-goal row meters, the "Reached" goal badge, positive stat tone.
- **Money Amber** (money-amber): close to the limit (category "left" amount when close; a category budget meter at 90% or more; stat cells in warning tone such as recurring burden).
- **Money Red** (money-red): over budget, negative net, overspend amounts, over-budget bar fills, the over-budget alert panel border (30% alpha). The same value is the destructive role the input error state already used: field errors, the load-error banner (border at 30%), destructive menu items, and negative status badges for failed or disabled records (12% fill, red text).

### Tertiary (identity)

- **Category hues**: generated rather than stored. `oklch(L C h)` with h cycling through 190, 280, 340, 220, 310, 115, 250, L = `--category-l` (0.68 light / 0.80 dark), C = `--category-c` (0.13 / 0.12). A second pass through the cycle darkens by `--category-tier-step` (0.20 / 0.22). They appear as 8px dots, category bar fills and donut segments.
- **Series 1-8** (series-1 ... series-8): the multi-series palette for generic time charts (e.g. AreaChart) where no category or money meaning applies. The yearly dashboard does not use it: per-category charts draw within-budget spend in the category hue and the over-budget portion in money-red, and the surplus-by-month chart draws surplus in money-green and deficit in money-red.

### Neutral

- **Page Grey** (page-grey): the inset content sheet. Dark `oklch(0.16 0.006 270)`.
- **Panel White** (panel-white): panels, popovers, stat cells. Dark `oklch(0.198 0.007 270)`, one step lifted.
- **Shell Grey** (shell-grey): sidebar and body behind the inset sheet. Dark `oklch(0.13 0.005 270)`, below the page.
- **Ink** (ink): all primary text, the actual-spend line, and neutral meter fills (55% alpha).
- **Muted Ink** (muted-ink): labels, captions, subtitles, nav icons, axis text, the budget-pace dashed line (60%).
- **Quiet Fill** (quiet-fill): segmented-control track, row hover (60%), hero chart column (40%).
- **Hairline** (hairline): every border and divider. Dark uses white at 8%.
- **Input Stroke** (input-stroke): field and outline-control borders. Dark uses white at 13%.
- **Track** (track): empty meter and bar tracks.
- **Shell Hover** (shell-hover): nav item hover and active fill.

### Named Rules

**The Money Means Money Rule.** Green, amber and red appear only when they report money state (under, close, over, net sign). Never use them for decoration, for category identity, or for success toasts that are unrelated to money.

**The One Voice Rule.** Indigo is for action, selection, focus and the today marker. Never use it to fill a chart, tint a panel or colour a category.

**The Separate Bands Rule.** Category hues (190, 220, 250, 280, 310, 340, 115) stay out of the money bands (red ~26, amber ~62, green ~156) and out of indigo's 270 at full chroma. A category never reads as a money state. When a category is over budget, its bar switches to Money Red because state overrides identity.

**The Neutral Ink Rule.** Data ink defaults to the foreground colour: the actual-spend line, meter fills with no state, chart grid and axis in hairline or muted ink. Colour enters a chart only to carry state or identity.

## Typography

**Display Font:** Inter Variable (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Inter Variable (same stack)

**Character:** One self-hosted variable family with automatic optical sizing. `cv11` (single-storey a) and `ss03` are set globally, so large figures stay tight and small labels stay open. Hierarchy comes from size, weight 600 and negative tracking, never from a second family.

### Hierarchy

- **Display** (600, 3.5rem; 2.75rem below `sm`, line-height 1, -0.035em, tabular): the single hero figure (Safe to Spend / month result). Its "/day" unit is set at body size in muted ink. One per screen.
- **Display (phone)** (600, 2.75rem, line-height 1, -0.035em, tabular): the same hero figure below `sm`. A step of its own, not an ad-hoc size; it pairs only with Display.
- **Headline** (600, 1.75rem; 1.5rem below `sm`, tracking-tight): the page greeting ("Hi, Glenn") and every route's page title ("Transactions", "Admin"), always with a body-size muted subtitle beneath. The landing page alone sets its one headline at 2.25rem / 3rem from `sm` with -0.035em tracking.
- **Title** (600, 1rem, tracking-tight): panel, section and dialog titles in sentence case ("Spending pace" is 0.875rem/500 inside the hero; the auth card title is 1.25rem).
- **Figure** (600, 1.25rem, tracking-tight, tabular): stat-strip values.
- **Body** (400, 0.875rem): rows, sentences, amounts; medium (500) for the emphasized amount in a sentence.
- **Label** (400, 0.75rem, muted): stat labels, sublines, meter captions.
- **Axis** (400, 0.6875rem, tabular, muted): chart axis ticks and in-chart annotations.

### Named Rules

**The Tabular Money Rule.** Every currency amount, percentage and day count is set with `tabular-nums`. Columns of money align on the digit.

**The Sentence Case Rule.** Titles, labels, sidebar nav items ("Savings goals"), tab labels ("Archived goals", "API keys") and dialog titles ("Add income", "Edit category") are sentence case, with no uppercase tracking, no eyebrows above titles, and no icon before the title text.

## Layout

The shell is a fixed left sidebar on shell grey, with content in an inset sheet (8px margin, 16px corner radius, 1px hairline, soft shadow) from `md` up. Below `md` the sidebar becomes a sheet and the content runs full-bleed. A sticky 48px header sits on the sheet with an 85% page-grey backdrop blur, a sidebar trigger, a breadcrumb (muted section / medium title) and the theme toggle. Touch targets in the header are 44px below `md` and 32px above.

Content is capped at `max-w-7xl` (1280px), with main padding of 16px, 24px at `md` and 32px at `lg`. Page rhythm: the header block is followed by 24px, panels stack at 16px, and section groups are separated by 32px. Inside panels the padding is 20px (24px at `sm`, 32px for the hero's figure column), and rows use 12px × 16-20px.

The hero splits 5fr : 7fr at `lg` (figure column | pace chart) and stacks below `lg` with a hairline between. The stat strip is a single panel with cells separated by 1px gaps over the hairline colour: 2 per row on phone, 3 at `sm`, one row at `lg`. Paired panels sit in a 2-column grid at `lg`.

Every non-dashboard route uses the same page frame: the header block (title and subtitle left; the period picker and the page's one primary action in an actions row that wraps on phones and sits right-aligned, bottom-aligned with the title, from `lg`), then 16px gaps between the stat strip and the ledger panel. Monthly ledger pages may add one side panel (budget by category, for example) beside the ledger only from `2xl` (1536px), at minmax(18rem, 22rem); below `2xl` it stacks under the ledger. Admin adds its tab nav directly under the header.

Settings-style sections (profile, API keys) are one panel each with a 16rem label column (Title plus a one-line muted description) beside the form from `lg`, stacked below; forms cap at 32-42rem. Auth pages and the landing page sit on shell grey with a 56px header (brand mark left, theme toggle right). Auth content is a single 384px card, high on the screen on phones (8vh top) and centred from `sm`. The landing page splits copy | a divided panel of feature rows from `lg` at max 1024px.

**The Thumb Rule.** Below `md`, every control a thumb hits is 44px: the period picker, toolbar search, pager buttons, row toggles, row action buttons and tab-nav items (40px). From `md` they return to the desk sizes (32-36px).

**The One Header Rule.** A route has one header (Headline title plus muted subtitle) and at most one primary-variant button in its actions row. Summary totals live in the stat strip, never in their own boxes beside the ledger.

## Elevation & Depth

This is a hybrid system. In light mode, depth is a soft, cool, low-offset shadow on panels and controls. In dark mode it is purely tonal: shell (0.13) sits under the page (0.16), which sits under panels (0.198), which sit under popovers (0.225). Resting shadows resolve to transparent, and only floating layers keep a shadow.

### Shadow Vocabulary

- **elev-xs** (`0 1px 2px 0 oklch(0.2 0.02 264 / 0.05)`): buttons, inputs, segmented-control active thumb. None in dark.
- **elev-sm** (`0 1px 2px 0 oklch(0.2 0.02 264 / 0.04), 0 2px 8px -2px oklch(0.2 0.02 264 / 0.06)`): panels and the inset content sheet. None in dark.
- **elev-md** (`0 2px 4px -1px oklch(0.2 0.02 264 / 0.06), 0 8px 24px -6px oklch(0.2 0.02 264 / 0.12)`): popovers, menus, dialogs. Dark: `0 8px 24px -6px oklch(0 0 0 / 0.5)`.

### Named Rules

**The Tonal Dark Rule.** In dark mode, a surface is raised by lightness, never by shadow. Only elements that float above the page (elev-md) cast one.

**The One Layer Rule.** A panel never sits inside another panel. Subdivide with hairline dividers, 1px-gap cells or a quiet-fill column instead.

## Shapes

Corners are soft and consistent, keyed off a 12px base: panels, dialogs, the inset sheet and the top corners of phone bottom sheets 16px, the segmented-control track 12px, controls/nav items/chips/row-scale buttons 10px, status badges, tag chips and the brand-mark tile also 10px, small inner elements 8px. Meters, bar tracks, dots and markers are fully round. Borders are 1px hairlines everywhere, and dividers inside panels are hairlines too, never shadows.

## Components

### Buttons

Refined and restrained.

- **Shape:** gently rounded (10px), 36px tall (32px small, 40px large).
- **Primary:** action indigo on near-white text, 8px × 16px, medium weight, elev-xs; hover is 90% opacity. Reserve it for the screen's one primary action ("Log expense"), with a leading 16px icon allowed.
- **Outline:** page-grey fill, input-stroke border, elev-xs; hover fills with indigo tint.
- **Focus:** ring-colour border plus a 3px focus-indigo ring at 50%.

### Segmented control

A quiet-fill track (12px radius, 3px inset, 36px). The active segment is a page-grey thumb with elev-xs and medium-weight ink text. Used for period switches (Monthly / Yearly, Last 6 months / Full year) and chart ranges (3 mo / 6 mo / 12 mo).

The admin tab nav is the same control built from links: a wrapping quiet-fill track, 30px items (40px below `md`) at 10px radius, inactive items muted ink that darken on hover, the active item a page-grey thumb with elev-xs, medium weight and `aria-current`.

### Cards / Containers (panels)

- **Corner Style:** 16px.
- **Background:** panel white (lifted in dark).
- **Shadow Strategy:** elev-sm in light, none in dark.
- **Border:** 1px hairline. Alert panels use Money Red at 30%.
- **Internal Padding:** 24px default. Data panels zero the vertical padding and let rows/cells own it.
- **Title:** sentence-case Title role with an optional one-line muted description, and no leading icon. A right-aligned "View all ›" or total is allowed.

### Inputs / Fields

- **Style:** 36px, 10px radius, 1px input-stroke, page-grey fill (white 13% wash in dark), elev-xs.
- **Focus:** ring-colour border plus a 3px focus-indigo ring at 50%.
- **Error:** destructive border with a destructive ring at 20% (40% in dark).

### Navigation

The sidebar sits on shell grey. Item labels are sentence case. Items are 32px, 10px radius, 14px text, with 16px icons in muted ink. Hover and active states fill with shell-hover. The active item is medium weight and its icon turns action indigo, the only colour in the sidebar besides the brand mark. Group labels are small and muted, in sentence case. Collapsed (icon) mode uses 32px squares.

### Safe-to-spend hero (signature)

One panel split figure | chart. The left column holds a small muted label, the Display figure with a muted "/day" unit, and one sentence of context with the key amount in medium weight (state-coloured only when over). The right column, on a 40% quiet fill, is the spending-pace chart. Actual cumulative spend is a 2px ink line over a faint ink fade (10% to 0), budget pace is a 1.5px dashed muted line, and the today/last-day dot is indigo with a 3px card-colour ring. Hovering or scrubbing (also keyboard focusable) moves a hairline cursor and an ink dot and updates a muted tabular readout of day, spent and pace.

### Stat strip

One panel of divided cells separated by 1px gaps over the hairline colour. Each cell has a label (with an optional info tooltip), a Figure value that is state-toned only when the figure is a money state, an optional 4px meter, and an optional muted trend line with an arrow icon.

### Category row and meter

A full-width row button: an 8px category dot, a medium-weight name, a 6px round meter on track filled in the category hue (or Money Red when over), muted "spent / planned" in tabular figures, and the remaining amount (amber when close, red "over" when over) with a trailing chevron that nudges 2px on hover. Rows are divided by hairlines and hover fills with quiet fill at 60%. Generic progress meters (`ui/progress`) fill with ink at 55%, not indigo.

The side-panel variant (category budget progress) is a compact 10px × 16-20px row: dot and medium-weight name, a muted tabular "N% of $X" (red and medium when over), and a 6px meter in the category hue that turns Money Amber at 90% and Money Red when over.

### Page header and period picker

The header is Headline title plus muted body subtitle, with the actions row beside it from `lg`. The period picker is one 36px panel-white control (44px below `md`) with a 1px stroke, 10px radius and elev-xs: muted ghost chevrons at each end and, in month mode, a borderless select trigger in medium tabular text that opens a jump-to-month list ("Jun 2026" below `sm`, "June 2026" above). Year mode shows the year as static medium tabular text between the chevrons. The primary action sits after it.

### Ledger panel (signature)

One 16px panel with elev-sm holding toolbar, rows and pager, separated by hairlines. The toolbar holds a search field with a leading muted search icon (max 384px, 44px below `md`), or a page-supplied server search, and a muted ghost "Columns" menu from `md` when more than two columns can hide.

Below `md` each record is a stacked ledger row, at least 56px tall: an optional lead (toggle or avatar), a medium-weight title, a muted 12px detail line whose parts are joined by "·" and ellipsized, a right-aligned value with an optional muted subvalue beneath, and the row-actions menu. Columns declare their place through a mobile role (lead, title, detail, value, subvalue). Columns without a role stay off the phone list, and phone-only columns can carry a combined line such as "GST $4.20". Date-based ledgers group consecutive rows under a quiet-fill (50%) heading in muted medium 12px text ("Fri, Oct 2", with the year added outside the current year). A clickable row is one full-row hit target that darkens with quiet fill on press.

From `md` it is a hairline table: 40px muted 12px medium headers, 48px rows divided by hairlines, 12px cell padding (16px outer, 20px from `lg`), amounts right-aligned, text truncated at 18rem, hover at 60% quiet fill, and keyboard-focusable rows with an inset focus ring. Empty states are one muted centred sentence ("No matches for “…”" when searching). The pager appears only past 10 rows: a muted tabular "1–20 of 46" left, a rows-per-page select (from `md`) and ghost chevrons right.

### Table cells

- **Money:** right-aligned, tabular, medium ink. Secondary amounts (GST, tips) are muted and regular. A money tone (green/red) is allowed only for money state.
- **Stack:** a truncated primary line over a muted 12px secondary. Identifiers can set the primary in 12px mono.
- **Category:** an 8px category-hue dot before the truncated name.
- **Status badge:** 20px, 10px radius, 12px medium. Tones: neutral (quiet fill, ink), muted (hairline outline, muted ink), positive (money green at 12% fill, green text), negative (red at 12% fill, red text).
- **Tag list:** wrapping 11px mono tags with a hairline outline and muted text. An empty list shows a muted em dash.

### Dialogs

Below `sm` every dialog is a bottom sheet: full width, 16px top corners, no side or bottom border, 20px padding plus the safe-area inset, capped at 92% of the viewport height with its own scroll, sliding up from the bottom. From `sm` it is a centred 512px dialog with 16px corners, 24px padding and a zoom-fade entrance. Both use elev-md. The header is left-aligned with a sentence-case Title and clears a 36px close button (32px from `sm`, 10px radius, muted icon). Footer buttons stack full-width on phones, primary on top, and sit right-aligned in a row from `sm`. Amount fields use `inputmode="decimal"` so phones open the number pad.

### Savings goal row

Goals are rows in one panel, not cards. Each row has a medium-weight name (the full-row hit target that opens contributions) with an optional status badge, a muted subline ("By …" · description), and a 6px meter on track filled in Money Green (muted ink at 50% when paused or archived). Above the meter sits the tabular "$X of $Y" and a muted "$Z to go · N%". At `lg` the row becomes three columns (16rem name | meter | actions); below `lg` the meter spans a second line. Actions are an outline "Contribute" button (icon-only below `sm`, 44px below `md`) and the row-actions menu.

### Choice list

Budget presets are a divided list of full-width choice rows (12px × 16-20px) inside the panel: a 16px radio (input-stroke ring when off, an action-indigo disc with a 6px on-indigo dot when on), a medium-weight label, and a tabular amount on the right that is medium when selected and muted otherwise. The custom choice edits inline with a right-aligned tabular amount field and Save / Cancel. Hover and focus fill with quiet fill at 60%.

### Paid toggle

On recurring rows, a 20px round check in a 44px (32px from `md`) hit area: an input-stroke ring when unpaid, darkening on hover, and an action-indigo disc with a 12px on-indigo check when paid. It flips optimistically and stays silent on success.

### Area chart

A panel titled "{Category} over time" with a muted description and a segmented range control. Spent is a 2px ink line over a 10%-to-0 ink fade, budgeted is a 1.5px dashed muted line at 60%, both on a monotone curve. A custom centred legend uses a short ink stroke and a dashed muted stroke rather than colour swatches. The footer reports the month-on-month change in red (up) or green (down) with a trend icon, and the range's average spend toned against the current budget.

### Section header and settings sections

A section header is a sentence-case Title with an optional muted body description and right-aligned actions, sitting on the page rather than in a panel. Settings sections are described under Layout.

### Messages

- **Form message:** a quiet-fill (60%) block at 10px radius, 10px × 12px, body text, with a 16px leading icon: circle-alert in Money Red for errors, circle-check for success. The build currently tints the success check money green; that use is outside the Money Means Money Rule and is not part of the system. Used inside auth and settings forms.
- **Load-error banner:** a panel-white block at 16px radius with a Money Red border at 30%, elev-sm, a red circle-alert icon and one body sentence. It replaces the stat strip and ledger when a load fails, rather than showing zeroed totals.

### Brand mark

A 24px action-indigo tile (10px radius) holding a 14px on-indigo circle-dollar icon (SVG), followed by "Sheppakai Budget" at 15px semibold, tracking-tight. Used in the auth and landing headers.

## Do's and Don'ts

### Do:

- **Do** put one answer figure first on a screen, in Display at 3.5rem, and give every other figure the Figure or Body role.
- **Do** colour money with Money Green / Amber / Red only when it reports under / close / over or a net sign.
- **Do** use action indigo only for the primary action, the active selection, focus and the today marker.
- **Do** identify categories with the generated category hue (dot, bar, donut segment) and keep it consistent for a category across a screen.
- **Do** draw chart data in ink and muted ink by default, with grid and axes in hairline and muted 11px tabular text.
- **Do** show each ledger figure once. If the hero states the remainder, the panels below do not repeat it.
- **Do** write sentence-case panel titles with no icon, plus an optional one-line muted description.
- **Do** subdivide panels with hairlines, 1px-gap cells or a quiet-fill column.
- **Do** keep light and dark at parity, raising dark surfaces by lightness, not shadow.
- **Do** limit motion to 150ms colour/shadow transitions and a single 500ms ease-out bar fill on load.
- **Do** build every route as header, stat strip, then ledger panel, with the period picker and one primary action in the header's actions row.
- **Do** give every ledger column a mobile role so phones get stacked rows, and group date ledgers under day headings.
- **Do** make phone controls 44px, and set `inputmode="decimal"` on amount fields.
- **Do** let dialogs become bottom sheets below `sm`, with full-width footer buttons.

### Don't:

- **Don't** nest a card inside a card.
- **Don't** use sparklines, progress rings or same-size KPI card grids. Use the stat strip, row meters or the pace chart. (A category breakdown donut is a composition chart, not a progress ring.)
- **Don't** put gradient washes on surfaces, panels, buttons or text. The only gradient is the neutral ink fade under the pace chart's actual-spend line, which is data ink.
- **Don't** use spinning beams, shimmer borders or looping decorative animation.
- **Don't** use a money hue for a category, or indigo for a category or chart series.
- **Don't** put icons before panel titles, uppercase eyebrows or kickers above titles.
- **Don't** set a second display family or use weight 700 for figures. The system tops out at 600.
- **Don't** use an amount without `tabular-nums`.
- **Don't** put summary totals in separate boxes beside the table. They go in the stat strip.
- **Don't** add a side panel beside the ledger below `2xl`, or one that repeats the stat strip.
