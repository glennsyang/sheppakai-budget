import { logger } from '$lib/server/logger';
import { getBetterAuthErrorMessage } from '$lib/utils';
import { isRedirect } from '@sveltejs/kit';
import { message } from 'sveltekit-superforms';
import type { SuperValidated } from 'sveltekit-superforms';

type MessageOptions = NonNullable<Parameters<typeof message>[2]>;

interface AuthFormActionOptions {
	loggerContext: string;
	fallbackMessage: string;
	buildErrorPayload: (errorMessage: string) => Parameters<typeof message>[1];
	status?: MessageOptions['status'];
}

export async function handleAuthFormAction<TForm extends Record<string, unknown>>(
	form: SuperValidated<TForm>,
	action: () => Promise<unknown>,
	options: AuthFormActionOptions
): Promise<unknown> {
	try {
		return await action();
	} catch (error) {
		if (isRedirect(error)) {
			throw error;
		}

		logger.error(options.loggerContext, error);
		const errorMessage = getBetterAuthErrorMessage(error, options.fallbackMessage);

		return message(form, options.buildErrorPayload(errorMessage), {
			status: (options.status ?? 400) as MessageOptions['status']
		});
	}
}
