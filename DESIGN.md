---
name: Sheppakai Budget
description: Household finances and side-business bookkeeping in one plain, trustworthy ledger.
colors:
  ink-navy: 'oklch(0.208 0.042 265.755)'
  paper-white: 'oklch(1 0 0)'
  deep-ink: 'oklch(0.129 0.042 264.695)'
  mist-slate: 'oklch(0.968 0.007 247.896)'
  ledger-grey: 'oklch(0.554 0.046 257.417)'
  hairline: 'oklch(0.929 0.013 255.508)'
  focus-slate: 'oklch(0.704 0.04 256.788)'
  overspend-red: 'oklch(0.577 0.245 27.325)'
  in-the-black-green: 'oklch(0.627 0.194 149.214)'
  caution-amber: 'oklch(0.769 0.188 70.08)'
  chart-copper: 'oklch(0.646 0.222 41.116)'
  chart-teal: 'oklch(0.6 0.118 184.704)'
  chart-harbour: 'oklch(0.398 0.07 227.392)'
  chart-mustard: 'oklch(0.828 0.189 84.429)'
typography:
  display:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: 'tnum'
  headline:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.33
    fontFeature: 'tnum'
  title:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '14px'
  full: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
components:
  button-primary:
    backgroundColor: '{colors.ink-navy}'
    textColor: '{colors.paper-white}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline:
    backgroundColor: '{colors.paper-white}'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
    height: '36px'
  button-outline-hover:
    backgroundColor: '{colors.mist-slate}'
  button-destructive:
    backgroundColor: '{colors.overspend-red}'
    textColor: '{colors.paper-white}'
    rounded: '{rounded.md}'
    height: '36px'
  card:
    backgroundColor: '{colors.paper-white}'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.xl}'
    padding: '24px'
  input:
    backgroundColor: '{colors.paper-white}'
    textColor: '{colors.deep-ink}'
    rounded: '{rounded.md}'
    padding: '4px 12px'
    height: '36px'
  badge:
    backgroundColor: '{colors.ink-navy}'
    textColor: '{colors.paper-white}'
    typography: '{typography.label}'
    rounded: '{rounded.full}'
    padding: '2px 8px'
---

<!-- BASELINE: records the incumbent system before a planned redesign. New visual work should replace this through /impeccable new-work, not extend it. -->

# Design System: Sheppakai Budget

## Overview

**Creative North Star: "The Household Ledger"**

The interface behaves like a well-kept ledger book. The neutral slate frame steps back and the numbers speak. Surfaces are white paper in light mode and deep ink-navy in dark mode. Hierarchy comes from the size and weight of figures, not from decoration. Colour is held back for meaning: green when you are in the black, red when you've overspent, amber when a limit is close. The chart palette gives categories their own identities.

The density is operational. It uses a sidebar shell, a compact 48px header, and grids of KPI cards that reflow from two columns on phones to four or five on desktop. The system is currently a near-stock shadcn-svelte "slate" theme on Tailwind v4, and this file records it as a **baseline before a redesign**. It describes what exists so the replacement can deliberately keep or discard each part.

**Key Characteristics:**

- Cool blue-grey neutrals with one near-black ink primary; no brand hue yet.
- Tabular numerals on every monetary figure.
- Green, red and amber carry money status. The chart palette carries category identity.
- Flat, bordered cards with barely-there shadows and a faint ink-tinted gradient wash.
- Full light and dark parity through CSS custom properties (`mode-watcher`).

## Colors

A cool, low-chroma slate frame with one ink primary. Saturated colour appears only where it means something.

### Primary

- **Ink Navy** (`ink-navy`): primary buttons, default badges, the icon wells in hero cards (at 10% alpha), and the faint `from-primary/5` gradient wash on KPI cards. In dark mode the roles invert: the primary becomes the Hairline tone and Ink Navy becomes card surface.

### Tertiary (semantic signal)

- **In-the-Black Green** (`in-the-black-green`, Tailwind green-600; green-400 in dark): positive net position, under-budget progress, income.
- **Overspend Red** (`overspend-red`, the `--destructive` token; red-400/500 used directly in many places): negative balances, over-budget cards, destructive actions.
- **Caution Amber** (`caution-amber`, amber-500 with 50/100 tints and 900/950 in dark): approaching-limit alerts and anomaly banners.

### Secondary (category identity)

- **Chart Copper, Chart Teal, Chart Harbour, Chart Mustard** (`--chart-1..4`) plus a fifth chart token. They are used for spending breakdowns, area charts and per-category CardBeam colours. The dark theme swaps in a separate, more saturated set (electric blue, jade, amber, violet, coral).

### Neutral

- **Paper White** (`paper-white`): page background and card surface in light mode.
- **Deep Ink** (`deep-ink`): body text in light mode, page background in dark mode.
- **Mist Slate** (`mist-slate`): secondary, muted and accent surfaces, and hover fills on outline and ghost buttons.
- **Ledger Grey** (`ledger-grey`): muted foreground for labels, captions, "/day" suffixes and helper text.
- **Hairline** (`hairline`): borders and input strokes. Dark mode uses white at 10% for borders and 15% for inputs.
- **Focus Slate** (`focus-slate`): focus rings at 50% alpha.

### Named Rules

**The Money-Means-Colour Rule.** Green, red and amber only ever report a money state. Never use them for decoration, emphasis or branding.

**The Category Palette Rule.** Chart tokens identify categories and series. They never signal good or bad.

## Typography

**Display Font:** system UI sans (`ui-sans-serif, system-ui, sans-serif`, Tailwind default)
**Body Font:** same stack
**Label/Mono Font:** same stack; `font-mono` appears only in a few API-key and technical spots

**Character:** there is no chosen typeface. The platform's system sans does all the work, and hierarchy comes from size and weight alone. It's functional and neutral, and it has no voice.

### Hierarchy

- **Display** (700, 1.875rem, tabular): hero figures such as Safe to Spend per day. Grows to 2.25–3rem on the landing page only.
- **Headline** (600, 1.5rem, tabular; 1.875rem inside wide card containers): KPI card values and page titles.
- **Title** (600, 1.125–1.25rem): card titles and section headers.
- **Body** (400, 0.875rem): the workhorse. It covers table cells, form text and descriptions (`text-sm` is by far the most-used size). Inputs are 1rem on mobile to stop iOS zoom, and 0.875rem from `md` up.
- **Label** (500, 0.75rem): badges, captions, "days left" and chart ticks.

### Named Rules

**The Tabular Figures Rule.** Every currency amount, percentage and count uses `tabular-nums` so columns and changing values don't jitter.

## Layout

The app shell uses the shadcn sidebar: a collapsible left rail (NavMain, NavSecondary, NavUser) and an inset content area with a 48px sticky header (`--header-height`). Content padding is 16px, and vertical padding tightens to 8px from `md`. Page sections stack with 16px gaps.

The dashboard is a set of responsive card grids:

- KPI rows: 2 columns → 3 at `sm` → 4 or 5 at `lg`.
- Paired panels: 1 column → 2 at `lg`.
- Main composition: stacked on mobile, 12-column grid at `lg`.
- Grid gaps are 16px (`gap-4`) and rows are separated by 24px (`mb-6`).

Breakpoints are Tailwind defaults (sm 640, md 768, lg 1024, xl 1280). Wide cards use container queries (`@container/card`) to scale figures when there's room. Monthly list pages share one shell, `MonthlyTablePageShell`, with a month/year switcher over a TanStack data table. Tables scroll horizontally on phones.

## Elevation & Depth

The system is flat and barely lifted. Borders define every surface. Shadows are ambient hints (`shadow-xs`, `shadow-sm`) that separate a card from the page without making it float. Hero and KPI cards add a very faint vertical wash from 5% ink up to the card colour. It suggests weight without adding a layer. Larger shadows (`shadow-md/lg/2xl`) appear only on popovers, dialogs and the landing page's glass card.

### Shadow Vocabulary

- **Hint** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): buttons, inputs and KPI cards.
- **Rest** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): the default card.
- **Overlay** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): popovers, dropdowns and sheets.

### Named Rules

**The Border-First Rule.** A 1px hairline border separates surfaces. Shadow never replaces the border.

## Shapes

The form language is softly rounded rectangles on a 10px base radius (`--radius: 0.625rem`):

- Cards: 14px (`xl`).
- Buttons and inputs: 8px (`md`).
- Small controls: 6px (`sm`).
- Full pills: badges, avatars and icon wells.

The only non-rectangular motif is the CardBeam: a conic-gradient sliver that spins around the border of an over-budget card.

## Components

### Buttons

Plain and compact.

- **Shape:** gently rounded (8px), 36px tall; 32px for `sm` and 40px for `lg`.
- **Primary:** Ink Navy fill, Paper White text, 14px medium, 16px horizontal padding, Hint shadow. Hover drops the fill to 90% opacity.
- **Outline:** page-colour fill with a hairline border. Hover fills Mist Slate.
- **Ghost / Link:** no chrome. Ghost hovers to Mist Slate, and Link underlines on hover.
- **Destructive:** Overspend Red fill with white text. It drops to 60% fill in dark mode.
- **Focus:** a 3px Focus Slate ring at 50% alpha, and the border shifts to the ring colour.

### Chips (Badges)

- **Style:** full pill, 12px medium, 2px × 8px padding. Variants are default (ink), secondary (mist), destructive (red) and outline.

### Cards / Containers

- **Corner Style:** 14px.
- **Background:** Paper White, or Ink Navy in dark mode. KPI and hero cards add the 5% ink gradient wash.
- **Shadow Strategy:** Rest shadow, or Hint on KPI cards. See Elevation & Depth.
- **Border:** 1px hairline.
- **Internal Padding:** 24px vertical, 24px horizontal content, with 24px gaps between header, content and footer.

### Inputs / Fields

- **Style:** 36px tall, 8px radius, hairline stroke, page-colour fill (white at 15% in dark), Hint shadow.
- **Focus:** a 3px Focus Slate ring at 50% alpha, and the border takes the ring colour.
- **Error / Disabled:** `aria-invalid` turns the border red with a 20% red ring. Disabled fields drop to 50% opacity.

### Navigation

- **Style:** the shadcn sidebar with its own token set (`--sidebar-*`). The active item is filled with sidebar-accent, and labels are 14px. On mobile the sidebar becomes an off-canvas sheet, opened from the header trigger.

### Budget Progress Card (signature)

A KPI card that shows spent against budget as a large tabular figure and a progress bar, with a footer caption. When a category goes over budget it's wrapped in a **CardBeam**: a 1.5px animated conic-gradient border in red, or in the category's chart colour, that rotates every 4s.

### Safe-to-Spend Hero Band (signature)

A full-width card that leads the dashboard. On the left, a circular ink icon well sits beside "Safe to Spend Today" and a Display-size per-day figure. On the right is the Net Position, in green or red, with the days left.

## Do's and Don'ts

### Do:

- **Do** use the semantic CSS tokens (`bg-card`, `text-muted-foreground`, `border`) so light and dark stay in parity.
- **Do** set every monetary figure in `tabular-nums`, with the value larger and bolder than its label.
- **Do** keep green, red and amber for money state, and the chart tokens for category identity.
- **Do** separate surfaces with a 1px hairline border and at most a Rest shadow.
- **Do** build new list pages on `MonthlyTablePageShell` and the existing card grid rhythm (16px gaps, 24px row spacing).

### Don't:

- **Don't** use green, red or amber decoratively. They always report a money state.
- **Don't** use chart colours to mean good or bad.
- **Don't** hard-code Tailwind palette colours where a semantic token exists. Many existing `text-red-400`/`text-green-600` usages are drift, not doctrine.
- **Don't** extend this baseline for new visual work. A redesign is planned, so route new visual direction through `/impeccable` new-work.
