import type { Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';

import { building, dev } from '$app/environment';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	// Fetch current session from Better Auth
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	// Make session and user available on server
	if (session) {
		event.locals.session = session.session;
		event.locals.user = {
			id: session.user.id,
			name: session.user.name ?? '',
			email: session.user.email,
			updatedAt: session.user.updatedAt?.toString() ?? ''
		};
	}

	return svelteKitHandler({ event, resolve, auth, building });
};
