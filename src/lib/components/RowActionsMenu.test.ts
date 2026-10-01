import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import RowActionsMenu from './RowActionsMenu.svelte';

describe('RowActionsMenu', () => {
	it('renders an accessible ellipsis trigger', () => {
		const html = render(RowActionsMenu, {
			props: { onEdit: () => {}, onDelete: () => {} }
		}).body;

		expect(html).toContain('<span class="sr-only">Open menu</span>');
		expect(html).toContain('size-8');
	});
});
