import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const sessionData = JSON.parse(sessionCookie);
			event.locals.user = {
				id: sessionData.userId,
				email: sessionData.email
			};
		} catch {
			// Invalid session cookie, clear it
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
