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
		},
		{
			// auth-guard.ts is kept identical across sibling repos, so its own tests may import
			// requireAdmin even though the app itself must not (see the rule below).
			files: ['src/lib/server/actions/auth-guard.test.ts'],
			rules: {
				'eslint/no-restricted-imports': 'off'
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
		// requireAdmin in the shared auth-guard.ts checks the DB role only, so it would 403 an
		// admin granted via ADMIN_USER_IDS. The file stays byte-identical across repos, so the
		// guard against using it here lives in config rather than in the file.
		'eslint/no-restricted-imports': [
			'error',
			{
				paths: [
					{
						name: '$lib/server/actions/auth-guard',
						importNames: ['requireAdmin'],
						message:
							'requireAdmin checks the role only and ignores ADMIN_USER_IDS. Use adminFormAction (actions) or assertAdmin (loads).'
					}
				]
			}
		],
		'typescript/no-non-null-assertion': 'error',
		'typescript/no-explicit-any': 'error'
	}
});
