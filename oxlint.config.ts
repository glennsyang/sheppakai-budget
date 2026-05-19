import { defineConfig } from 'oxlint';

export default defineConfig({
	categories: { correctness: 'error' },
	env: {
		browser: true,
		node: true,
		vitest: true,
		svelte: true
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
	plugins: ['eslint', 'typescript', 'oxc', 'vitest', 'unicorn'],
	rules: {
		'no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_'
			}
		]
	}
});
