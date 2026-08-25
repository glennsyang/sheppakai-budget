import { defineConfig } from 'oxlint';

export default defineConfig({
	categories: { correctness: 'error', perf: 'off', style: 'off', suspicious: 'off' },
	env: {
		browser: true,
		node: true,
		svelte: true,
		vitest: true
	},
	ignorePatterns: [
		'**/node_modules',
		'**/.claude',
		'.svelte-kit',
		'build',
		'**/.DS_Store',
		'**/.env',
		'**/.env.*',
		'!**/.env.example',
		'!**/.env.test',
		'**/*.db',
		'src/lib/components/ui/**'
	],
	options: {
		typeAware: true,
		typeCheck: true
	},
	overrides: [
		{
			// Non-null assertions are legitimate in test fixtures, where the setup guarantees the value.
			files: ['**/*.test.ts'],
			rules: {
				'typescript/no-non-null-assertion': 'off'
			}
		},
		{
			// logger.ts is copied byte-for-byte from claude-sveltekit-toolkit's shared/server/logger.ts
			// and kept identical across sibling repos (meal-planner, synapse) via /propagate-shared —
			// don't add inline lint-disable comments here, suppress via config instead. The flagged
			// String(error) fallback only runs when JSON.stringify(error) itself throws, which is an
			// intentional last-resort stringification, not a real defaultToString() bug.
			files: ['src/lib/server/logger.ts'],
			rules: {
				'typescript/no-base-to-string': 'off'
			}
		}
	],
	plugins: ['eslint', 'typescript', 'oxc', 'vitest', 'unicorn'],
	rules: {
		'no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}
		],
		'typescript/no-non-null-assertion': 'error'
	}
});
