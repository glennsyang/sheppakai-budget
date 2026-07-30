import type { ActionResult } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';

import { actionMessage } from './actionMessage';

const fallbacks = { success: 'Fallback success', error: 'Fallback error' };

describe('actionMessage', () => {
	it('returns the success message carried by the form', () => {
		const result: ActionResult = {
			type: 'success',
			status: 200,
			data: { form: { message: { type: 'success', text: 'Budget saved successfully' } } }
		};

		expect(actionMessage(result, fallbacks)).toEqual({
			type: 'success',
			text: 'Budget saved successfully'
		});
	});

	it('returns the error message carried by the form', () => {
		const result: ActionResult = {
			type: 'failure',
			status: 500,
			data: { form: { message: { type: 'error', text: 'Failed to set user role' } } }
		};

		expect(actionMessage(result, fallbacks)).toEqual({
			type: 'error',
			text: 'Failed to set user role'
		});
	});

	it('falls back to a legacy data.error string on failure', () => {
		const result: ActionResult = {
			type: 'failure',
			status: 400,
			data: { error: 'Cannot delete goal. Please delete all 2 contribution(s) first.' }
		};

		expect(actionMessage(result, fallbacks)).toEqual({
			type: 'error',
			text: 'Cannot delete goal. Please delete all 2 contribution(s) first.'
		});
	});

	it('uses the error fallback when a failure carries nothing usable', () => {
		const result: ActionResult = { type: 'failure', status: 400, data: { hasId: false } };

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'error', text: 'Fallback error' });
	});

	it('ignores a malformed message payload', () => {
		const result: ActionResult = {
			type: 'failure',
			status: 500,
			data: { form: { message: 'just a string' } }
		};

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'error', text: 'Fallback error' });
	});

	it('reads the message off an error result', () => {
		const result: ActionResult = { type: 'error', status: 500, error: new Error('Boom') };

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'error', text: 'Boom' });
	});

	it('uses the error fallback when an error result carries a non-Error', () => {
		const result: ActionResult = { type: 'error', status: 500, error: 'plain string' };

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'error', text: 'Fallback error' });
	});

	it('treats a redirect as a success', () => {
		const result: ActionResult = { type: 'redirect', status: 302, location: '/dashboard' };

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'success', text: 'Fallback success' });
	});

	it('uses the success fallback when a success carries no message', () => {
		const result: ActionResult = { type: 'success', status: 200 };

		expect(actionMessage(result, fallbacks)).toEqual({ type: 'success', text: 'Fallback success' });
	});
});
