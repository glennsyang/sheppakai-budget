import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import LoadErrorBanner from './LoadErrorBanner.svelte';

describe('LoadErrorBanner', () => {
	it('renders the message in an alert', () => {
		const html = render(LoadErrorBanner, {
			props: { message: 'Failed to load income data.' }
		}).body;

		expect(html).toContain('role="alert"');
		expect(html).toContain('Failed to load income data.');
	});
});
