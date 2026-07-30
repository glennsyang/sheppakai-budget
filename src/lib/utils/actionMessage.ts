import type { ActionResult } from '@sveltejs/kit';

function isMessage(value: unknown): value is App.Superforms.Message {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;
	return (
		(candidate.type === 'error' || candidate.type === 'success') &&
		typeof candidate.text === 'string'
	);
}

/**
 * Read the `App.Superforms.Message` out of an ActionResult.
 *
 * Most forms in the app are superForm-driven and read `$message` directly. The two that are not
 * (`ConfirmModal` and `PresetBudgetCard` submit via plain `use:enhance` from `$app/forms`) see the
 * raw ActionResult instead, so this is the single place that knows how to unwrap one.
 *
 * The response shapes come from `docs/ERROR_HANDLING_POLICY.md`. The `data.error` branch covers
 * actions that have not yet been migrated to that contract, plus the `requireAuth` 401 wall, which
 * runs before `superValidate` and so has no form to carry a message.
 */
export function actionMessage(
	result: ActionResult,
	fallbacks: { success: string; error: string }
): App.Superforms.Message {
	if (result.type === 'redirect') {
		return { type: 'success', text: fallbacks.success };
	}

	if (result.type === 'error') {
		return {
			type: 'error',
			text: result.error instanceof Error ? result.error.message : fallbacks.error
		};
	}

	const data = result.data as { form?: { message?: unknown }; error?: unknown } | undefined;

	if (isMessage(data?.form?.message)) {
		return data.form.message;
	}

	if (result.type === 'failure') {
		return {
			type: 'error',
			text: typeof data?.error === 'string' ? data.error : fallbacks.error
		};
	}

	return { type: 'success', text: fallbacks.success };
}
