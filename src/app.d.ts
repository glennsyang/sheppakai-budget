// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User } from '$lib/types';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: User;
			session?: {
				id: string;
				createdAt: Date;
				updatedAt: Date;
				userId: string;
				expiresAt: Date;
				token: string;
				ipAddress?: string | null | undefined;
				userAgent?: string | null | undefined;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
