import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),

		// Nonce-based CSP: eliminates unsafe-inline from script-src.
		// Sentry's sentryHandle() automatically reads the nonce SvelteKit generates.
		csp: {
			mode: 'nonce',
			directives: {
				'default-src': ['self'],
				// unsafe-inline is intentionally absent — replaced by the per-request nonce.
				// unsafe-eval is not included: layerchart/d3-scale/d3-shape do not use
				// Function() or eval(); d3-dsv (which does) is never imported.
				'script-src': ['self'],
				// unsafe-inline is absent: SvelteKit nonce mode injects a nonce attribute
				// onto every <style> element it renders during SSR, so inline styles
				// are covered by the nonce rather than the blanket unsafe-inline.
				'style-src': ['self'],
				'img-src': ['self', 'data:', 'https:'],
				'font-src': ['self'],
				'connect-src': ['self', 'https://*.ingest.us.sentry.io', 'https://*.ingest.sentry.io'],
				'frame-ancestors': ['none'],
				'object-src': ['none'],
				'base-uri': ['self']
			}
		},

		experimental: {
			explicitEnvironmentVariables: true,

			tracing: {
				server: true
			},

			instrumentation: {
				server: true
			}
		}
	}
};

export default config;
