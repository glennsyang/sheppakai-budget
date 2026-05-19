import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn(async (_options?: { where?: unknown }) => [])
}));

vi.mock('drizzle-orm', () => ({
	and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
	asc: (field: unknown) => ({ type: 'asc', field }),
	sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
		type: 'sql',
		text: strings.join('?'),
		values
	})
}));

vi.mock('../schema', () => ({
	income: { date: 'income.date' }
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn<() => void>(),
		findFirst: vi.fn<() => void>()
	})
}));

import { incomeQueries } from './income';

describe('incomeQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findAll.mockResolvedValue([]);
	});

	describe('findByDateRange', () => {
		it('calls findAll with a compound where clause', async () => {
			await incomeQueries.findByDateRange('2026-01-01', '2026-01-31');

			const arg = mockState.findAll.mock.lastCall![0] as unknown as { where: { type: string } };
			expect(arg.where.type).toBe('and');
		});
	});

	describe('findByMonth', () => {
		it('calculates correct boundaries for February in a non-leap year', async () => {
			const spy = vi.spyOn(incomeQueries, 'findByDateRange').mockResolvedValue([]);
			await incomeQueries.findByMonth(2, 2026);
			expect(spy).toHaveBeenCalledWith('2026-02-01', '2026-02-28');
			spy.mockRestore();
		});

		it('calculates correct boundaries for February in a leap year', async () => {
			const spy = vi.spyOn(incomeQueries, 'findByDateRange').mockResolvedValue([]);
			await incomeQueries.findByMonth(2, 2024);
			expect(spy).toHaveBeenCalledWith('2024-02-01', '2024-02-29');
			spy.mockRestore();
		});

		it('calculates correct boundaries for December', async () => {
			const spy = vi.spyOn(incomeQueries, 'findByDateRange').mockResolvedValue([]);
			await incomeQueries.findByMonth(12, 2025);
			expect(spy).toHaveBeenCalledWith('2025-12-01', '2025-12-31');
			spy.mockRestore();
		});

		it('pads single-digit month in start/end dates', async () => {
			const spy = vi.spyOn(incomeQueries, 'findByDateRange').mockResolvedValue([]);
			await incomeQueries.findByMonth(5, 2026);
			expect(spy).toHaveBeenCalledWith('2026-05-01', '2026-05-31');
			spy.mockRestore();
		});
	});
});
