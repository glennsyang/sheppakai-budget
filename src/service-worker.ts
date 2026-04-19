/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare let self: ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	// Only handle same-origin requests
	if (url.origin !== self.location.origin) return;

	// Skip API routes — always go to the network
	if (url.pathname.startsWith('/api/')) return;

	// Cache-first for precached static assets
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(event.request).then((cached) => cached ?? fetch(event.request))
		);
		return;
	}

	// Network-first for navigation and everything else
	event.respondWith(
		fetch(event.request).catch(() =>
			caches
				.match(event.request)
				.then((cached) => cached ?? new Response('You are offline.', { status: 503 }))
		)
	);
});
