import { describe, expect, it } from 'vitest';

import { getCrudMessage } from './messages';

describe('getCrudMessage', () => {
	describe('default messages', () => {
		it('createSuccess interpolates entity name', () => {
			expect(getCrudMessage('createSuccess', 'Transaction')).toBe(
				'Transaction created successfully'
			);
		});

		it('createError interpolates lowercase entity name', () => {
			expect(getCrudMessage('createError', 'Transaction')).toBe(
				'Failed to create transaction. A database error occurred.'
			);
		});

		it('updateSuccess interpolates entity name', () => {
			expect(getCrudMessage('updateSuccess', 'Category')).toBe('Category updated successfully');
		});

		it('updateError interpolates lowercase entity name', () => {
			expect(getCrudMessage('updateError', 'Category')).toBe(
				'Failed to update category. A database error occurred.'
			);
		});

		it('deleteSuccess interpolates entity name', () => {
			expect(getCrudMessage('deleteSuccess', 'Budget')).toBe('Budget deleted successfully');
		});

		it('deleteError interpolates lowercase entity name', () => {
			expect(getCrudMessage('deleteError', 'Budget')).toBe(
				'Failed to delete budget. A database error occurred.'
			);
		});
	});

	describe('custom message overrides', () => {
		it('uses custom createSuccess when provided', () => {
			const custom = { createSuccess: 'Saved!' };
			expect(getCrudMessage('createSuccess', 'Transaction', custom)).toBe('Saved!');
		});

		it('uses custom deleteError when provided', () => {
			const custom = { deleteError: 'Cannot delete — it has dependencies.' };
			expect(getCrudMessage('deleteError', 'Item', custom)).toBe(
				'Cannot delete — it has dependencies.'
			);
		});

		it('falls back to default when custom object omits the operation', () => {
			const custom = { createSuccess: 'OK' };
			expect(getCrudMessage('updateSuccess', 'Thing', custom)).toBe('Thing updated successfully');
		});

		it('falls back to default when customMessages is undefined', () => {
			expect(getCrudMessage('createSuccess', 'Income', undefined)).toBe(
				'Income created successfully'
			);
		});
	});
});
