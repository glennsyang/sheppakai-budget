import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('$lib/server/auth', () => ({
	assertAdmin: (locals: App.Locals) => {
		if (!locals.user) throw new Error('Unauthorized');
		if (locals.user.role !== 'admin') throw new Error('Forbidden');
	}
}));

vi.mock('$lib/server/logger', () => ({
	logger: {
		error: vi.fn<() => void>(),
		warn: vi.fn<() => void>(),
		info: vi.fn<() => void>(),
		debug: vi.fn<() => void>()
	}
}));

import { adminFormAction } from './admin-guard';

const schema = z.object({ id: z.string().min(1, 'ID is required') });

const admin = { id: 'admin-1', role: 'admin' };

function event(user: unknown, body: Record<string, string>) {
	return {
		locals: { user },
		request: new Request('https://budget.example.com/admin?/act', {
			method: 'POST',
			body: new URLSearchParams(body)
		})
	} as never;
}

describe('adminFormAction', () => {
	const handler = vi.fn<() => Promise<string>>(async () => 'handled');

	beforeEach(() => {
		handler.mockClear();
	});

	it('rejects an anonymous caller with 401 without calling the handler', async () => {
		const result = await adminFormAction(schema, handler)(event(null, { id: 'x' }));

		expect(result).toMatchObject({
			status: 401,
			data: { form: { message: { type: 'error', text: 'Unauthorized' } } }
		});
		expect(handler).not.toHaveBeenCalled();
	});

	it('rejects a non-admin with 403 without calling the handler', async () => {
		const result = await adminFormAction(
			schema,
			handler
		)(event({ id: 'u-1', role: 'user' }, { id: 'x' }));

		expect(result).toMatchObject({
			status: 403,
			data: { form: { message: { type: 'error', text: 'Forbidden' } } }
		});
		expect(handler).not.toHaveBeenCalled();
	});

	it('rejects before validating the form for a non-admin', async () => {
		const result = await adminFormAction(
			schema,
			handler
		)(event({ id: 'u-1', role: 'user' }, { id: '' }));

		expect(result).toMatchObject({ status: 403 });
	});

	it('returns the default invalid-form message for an admin with a bad form', async () => {
		const result = await adminFormAction(schema, handler)(event(admin, { id: '' }));

		expect(result).toMatchObject({
			status: 400,
			data: {
				form: {
					valid: false,
					message: { type: 'error', text: 'Please correct the errors in the form.' }
				}
			}
		});
		expect(handler).not.toHaveBeenCalled();
	});

	it('uses the custom invalid-form message when given', async () => {
		const result = await adminFormAction(schema, handler, {
			invalidMessage: 'User ID is required'
		})(event(admin, { id: '' }));

		expect(result).toMatchObject({
			status: 400,
			data: { form: { message: { text: 'User ID is required' } } }
		});
	});

	it('calls the handler with the parsed form and the admin user', async () => {
		const e = event(admin, { id: 'abc' });

		const result = await adminFormAction(schema, handler)(e);

		expect(result).toBe('handled');
		expect(handler).toHaveBeenCalledWith(
			e,
			expect.objectContaining({ valid: true, data: { id: 'abc' } }),
			admin
		);
	});
});
