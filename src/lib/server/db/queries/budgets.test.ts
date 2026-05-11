import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn(async (_options?: { where?: unknown }) => [])
}));

vi.mock('drizzle-orm', () => ({
	and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
	asc: (field: unknown) => ({ type: 'asc', field }),
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value })
}));

vi.mock('../schema', () => ({
	budget: {
		year: 'budget.year',
		month: 'budget.month',
		categoryId: 'budget.category_id'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn(),
		findFirst: vi.fn()
	})
}));

// padMonth is a real utility — do NOT mock it
vi.mock('$lib/utils/dates', async (importOriginal) => {
	const actual = await importOriginal<typeof import('$lib/utils/dates')>();
	return { padMonth: actual.padMonth };
});

import { budgetQueries } from './budgets';

describe('budgetQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findAll.mockResolvedValue([]);
	});

	describe('findByMonthYear', () => {
		it('calls findAll with stringified year and padded month', async () => {
			await budgetQueries.findByMonthYear(3, 2026);

			expect(mockState.findAll).toHaveBeenCalledWith({
				where: expect.objectContaining({ type: 'and' })
			});

			const { conditions } = (
				mockState.findAll.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ type: string; field: string; value: string }> };
				}
			).where;
			expect(conditions).toHaveLength(2);
			const yearCond = conditions.find((c) => c.field === 'budget.year');
			const monthCond = conditions.find((c) => c.field === 'budget.month');
			expect(yearCond?.value).toBe('2026');
			expect(monthCond?.value).toBe('03');
		});

		it('pads single-digit month to two digits', async () => {
			await budgetQueries.findByMonthYear(9, 2025);
			const { conditions } = (
				mockState.findAll.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ field: string; value: string }> };
				}
			).where;
			const monthCond = conditions.find((c) => c.field === 'budget.month');
			expect(monthCond?.value).toBe('09');
		});

		it('handles December (two digits, no padding needed)', async () => {
			await budgetQueries.findByMonthYear(12, 2025);
			const { conditions } = (
				mockState.findAll.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ field: string; value: string }> };
				}
			).where;
			const monthCond = conditions.find((c) => c.field === 'budget.month');
			expect(monthCond?.value).toBe('12');
		});
	});

	describe('findByYear', () => {
		it('calls findAll with stringified year', async () => {
			await budgetQueries.findByYear(2026);

			expect(mockState.findAll).toHaveBeenCalledWith({
				where: { type: 'eq', field: 'budget.year', value: '2026' }
			});
		});
	});

	describe('findByCategoryAndMonth', () => {
		it('calls findAll with compound and condition containing category, year, month', async () => {
			await budgetQueries.findByCategoryAndMonth('cat-1', 5, 2026);

			const { conditions } = (
				mockState.findAll.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ field: string; value: string }> };
				}
			).where;
			expect(conditions).toHaveLength(3);
			const catCond = conditions.find((c) => c.field === 'budget.category_id');
			const yearCond = conditions.find((c) => c.field === 'budget.year');
			const monthCond = conditions.find((c) => c.field === 'budget.month');
			expect(catCond?.value).toBe('cat-1');
			expect(yearCond?.value).toBe('2026');
			expect(monthCond?.value).toBe('05');
		});
	});
});
