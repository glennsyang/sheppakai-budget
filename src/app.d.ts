// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { User } from '$lib/types';
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			requestId?: string;
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

		// Shape of every sveltekit-superforms `message(form, ...)` payload.
		// Without this declaration superforms falls back to `any`, which let
		// object payloads reach pages that treated the message as a string.
		namespace Superforms {
			type Message = { type: 'error' | 'success'; text: string };
		}
	}
}
