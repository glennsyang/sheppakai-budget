---
name: svelte-code-writer
description: Svelte 5 documentation lookup and code analysis via the project's svelte MCP server. MUST be used whenever creating or editing any Svelte component (.svelte) or Svelte module (.svelte.ts/.svelte.js).
---

# Svelte 5 Code Writer

This project registers the official Svelte MCP server directly (see `.mcp.json`), so use its tools rather than shelling out to a CLI.

## MCP Tools

### List Documentation Sections

Call `mcp__svelte__list-sections`.

Lists all available Svelte 5 and SvelteKit documentation sections with titles and paths.

### Get Documentation

Call `mcp__svelte__get-documentation` with the section path(s) from `list-sections`.

**Example:** request sections `$state,$derived,$effect` after finding them via `list-sections`.

### Svelte Autofixer

Call `mcp__svelte__svelte-autofixer` with the component code to analyze.

Analyzes Svelte code and suggests fixes for common issues (runes usage, deprecated Svelte 4 patterns, accessibility, etc.).

## Workflow

1. **Uncertain about syntax?** Call `list-sections` then `get-documentation` for relevant topics.
2. **Reviewing/debugging?** Call `svelte-autofixer` on the code to detect issues.
3. **Always validate** — call `svelte-autofixer` before finalizing any Svelte component.
