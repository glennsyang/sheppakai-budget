import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

export const handle: Handle = async ({ event, resolve }) => {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const sessionData = JSON.parse(sessionCookie);
			const foundUser = await db.query.user.findFirst({ where: eq(user.id, sessionData.userId) });

			if (foundUser) {
				event.locals.user = {
					id: foundUser.id,
					firstName: foundUser.firstName ?? '',
					lastName: foundUser.lastName ?? '',
					email: foundUser.email,
					updatedAt: foundUser.updatedAt
				};
			}
		} catch {
			// Invalid session cookie, clear it
			event.cookies.delete('session', { path: '/' });
		}
	}

	return resolve(event);
};
