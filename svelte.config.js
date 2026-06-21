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
				// No unsafe-eval or unsafe-inline: layerchart/d3-scale/d3-shape do not use
				// Function() or eval(); nonce-based CSP covers SvelteKit-injected scripts.
				'script-src': ['self'],
				// <style> elements: SvelteKit nonce covers SSR-injected ones.
				// unsafe-inline also required for chart libraries (layerchart) that inject
				// <style> elements at runtime after SSR, where no nonce is available.
				'style-src-elem': ['self', 'unsafe-inline'],
				// style="" attributes: unsafe-inline required for dynamic CSS custom
				// properties (e.g. bits-ui --bits-collapsible-content-height, chart colour
				// vars) whose values are computed at runtime and cannot be hashed.
				'style-src-attr': ['unsafe-inline'],
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
