import { dev } from '$app/environment';
import type { Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { ensureMigrated } from '$lib/server/db/init';

// Run migrations on startup
ensureMigrated();

export const handle: Handle = async ({ event, resolve }) => {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	const sessionCookie = event.cookies.get('session');

	if (sessionCookie) {
		try {
			const sessionData = JSON.parse(sessionCookie);
			const foundUser = await getDb().query.user.findFirst({
				where: eq(user.id, sessionData.userId)
			});

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
