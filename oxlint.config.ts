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
