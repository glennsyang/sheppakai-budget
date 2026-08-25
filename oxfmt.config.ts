import { defineConfig } from 'oxfmt';

export default defineConfig({
	arrowParens: 'always',
	ignorePatterns: [
		'.claude',
		'.fallow',
		'.svelte-kit',
		'.wrangler',
		'build',
		'coverage',
		'data',
		'node_modules',
		'package-lock.json',
		'/static',
		'/drizzle',
		'src/lib/components/ui/',
		'/.github/skills/',
		'/AGENTS.md',
		'*.toml',
		// Copied byte-for-byte from claude-sveltekit-toolkit's shared/server/logger.ts and kept
		// identical across sibling repos (meal-planner, synapse) via /propagate-shared — don't
		// let oxfmt reformat it locally, that would defeat the point of unifying it.
		'src/lib/server/logger.ts'
	],
	printWidth: 100,
	semi: true,
	singleQuote: true,
	sortImports: true,
	sortTailwindcss: true,
	svelte: true,
	tabWidth: 2,
	trailingComma: 'none',
	useTabs: true
});
