import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import AuthFormField from './AuthFormField.svelte';

describe('AuthFormField', () => {
	it('renders a labelled input wired to the given id', () => {
		const html = render(AuthFormField, {
			props: {
				id: 'email',
				label: 'Email',
				type: 'email',
				placeholder: 'Enter your email',
				value: 'user@example.com',
				autocomplete: 'email',
				required: true
			}
		}).body;

		expect(html).toContain('for="email"');
		expect(html).toContain('id="email"');
		expect(html).toContain('name="email"');
		expect(html).toContain('type="email"');
		expect(html).toContain('placeholder="Enter your email"');
		expect(html).toContain('value="user@example.com"');
		expect(html).toContain('autocomplete="email"');
		expect(html).toContain('required');
		expect(html).toContain('Email');
	});

	it('omits the required attribute by default', () => {
		const html = render(AuthFormField, {
			props: { id: 'name', label: 'Name', value: '' }
		}).body;

		expect(html).not.toContain('required');
		expect(html).toContain('type="text"');
	});

	it('applies error styling and renders messages when errors are present', () => {
		const html = render(AuthFormField, {
			props: {
				id: 'password',
				label: 'Password',
				type: 'password',
				value: '',
				errors: ['Password must be at least 12 characters']
			}
		}).body;

		expect(html).toContain('border-red-400');
		expect(html).toContain('Password must be at least 12 characters');
	});

	it('does not render an error paragraph when there are no errors', () => {
		const html = render(AuthFormField, {
			props: { id: 'password', label: 'Password', type: 'password', value: '' }
		}).body;

		expect(html).not.toContain('border-red-400');
		expect(html).not.toContain('text-red-200');
	});
});
