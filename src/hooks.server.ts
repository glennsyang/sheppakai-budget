import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const sessionData = JSON.parse(sessionCookie);
			event.locals.user = {
				id: sessionData.userId,
				firstName: sessionData.firstName,
				lastName: sessionData.lastName,
				email: sessionData.email
			};
		} catch {
			// Invalid session cookie, clear it
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
