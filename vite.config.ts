import { sentrySvelteKit } from '@sentry/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			org: 'sheppakai',
			project: 'javascript-sveltekit'
		}),
		tailwindcss(),
		sveltekit()
	],
	server: {
		watch: {
			ignored: ['**/data/**', '**/node_modules/**']
		}
	},
	test: {
		coverage: {
			provider: 'v8',
			include: ['src/**/*.{ts,svelte.ts}'],
			exclude: [
				'src/**/*.test.ts',
				'src/**/*.d.ts',
				'src/routes/**',
				'src/lib/components/ui/**',
				'src/app.ts',
				'src/service-worker.ts'
			],
			reporter: ['text', 'lcov', 'html', 'json-summary', 'json']
		},
		reporters: process.env.GITHUB_ACTIONS ? ['default', 'github-actions'] : ['default']
	}
});
