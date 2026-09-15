import { describe, expect, it } from 'vitest';

import {
	apiCreateWindowCleaningCustomerSchema,
	apiUpdateWindowCleaningCustomerSchema
} from './window-cleaning-customers';

const valid = {
	name: 'Jane Doe',
	address: '123 Main St',
	city: 'Vancouver'
};

describe('apiCreateWindowCleaningCustomerSchema', () => {
	it('accepts a valid body', () => {
		expect(apiCreateWindowCleaningCustomerSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a missing name', () => {
		expect(apiCreateWindowCleaningCustomerSchema.safeParse({ ...valid, name: '' }).success).toBe(
			false
		);
	});

	it('rejects a missing address', () => {
		expect(apiCreateWindowCleaningCustomerSchema.safeParse({ ...valid, address: '' }).success).toBe(
			false
		);
	});

	it('rejects an invalid email', () => {
		expect(
			apiCreateWindowCleaningCustomerSchema.safeParse({ ...valid, email: 'not-an-email' }).success
		).toBe(false);
	});

	it('rejects an id field (server-generated)', () => {
		const result = apiCreateWindowCleaningCustomerSchema.safeParse({
			...valid,
			id: 'client-supplied'
		});
		expect(result.success && !('id' in result.data)).toBe(true);
	});
});

describe('apiUpdateWindowCleaningCustomerSchema', () => {
	it('accepts a valid full replace body', () => {
		expect(apiUpdateWindowCleaningCustomerSchema.safeParse(valid).success).toBe(true);
	});

	it('rejects a missing city', () => {
		expect(apiUpdateWindowCleaningCustomerSchema.safeParse({ ...valid, city: '' }).success).toBe(
			false
		);
	});
});
