import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockState = vi.hoisted(() => ({
	findAll: vi.fn(async (_options?: { where?: unknown }) => [])
}));

vi.mock('drizzle-orm', () => ({
	and: (...conditions: unknown[]) => ({ type: 'and', conditions }),
	desc: (field: unknown) => ({ type: 'desc', field }),
	eq: (field: unknown, value: unknown) => ({ type: 'eq', field, value }),
	sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({
		type: 'sql',
		text: strings.join('?'),
		values
	})
}));

vi.mock('../schema', () => ({
	windowCleaningJob: {
		jobDate: 'wc_job.job_date',
		customerId: 'wc_job.customer_id'
	}
}));

vi.mock('./factory', () => ({
	createQueryBuilder: () => ({
		findAll: mockState.findAll,
		findById: vi.fn<() => void>,
		findFirst: vi.fn<() => void>
	})
}));

import { windowCleaningJobQueries } from './windowCleaningJobs';

describe('windowCleaningJobQueries', () => {
	beforeEach(() => {
		mockState.findAll.mockReset();
		mockState.findAll.mockResolvedValue([]);
	});

	describe('findAll', () => {
		it('fetches all jobs with no filter', async () => {
			await windowCleaningJobQueries.findAll();

			expect(mockState.findAll).toHaveBeenCalledWith();
		});
	});

	describe('findByCustomer', () => {
		it('filters by customerId', async () => {
			await windowCleaningJobQueries.findByCustomer('cust-99');

			expect(mockState.findAll).toHaveBeenCalledWith({
				where: { type: 'eq', field: 'wc_job.customer_id', value: 'cust-99' }
			});
		});
	});

	describe('findByMonth', () => {
		it('passes a compound and clause with date bounds', async () => {
			await windowCleaningJobQueries.findByMonth(4, 2026);

			const arg = mockState.findAll.mock.lastCall![0] as unknown as {
				where: { type: string; conditions: unknown[] };
			};
			expect(arg.where.type).toBe('and');
			expect(arg.where.conditions).toHaveLength(2);
		});

		it('computes correct February (non-leap year) end date', async () => {
			const spy = vi.spyOn(mockState, 'findAll');
			await windowCleaningJobQueries.findByMonth(2, 2026);
			const { conditions } = (
				spy.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ values: string[] }> };
				}
			).where;
			// SQL conditions have values array; last value of second condition is endDate
			const sqlConds = conditions.filter((c): c is { values: string[] } => 'values' in c);
			const endDateValues = sqlConds.map((c) => c.values[1]).filter(Boolean);
			expect(endDateValues).toContain('2026-02-28');
		});

		it('computes correct February (leap year) end date', async () => {
			const spy = vi.spyOn(mockState, 'findAll');
			await windowCleaningJobQueries.findByMonth(2, 2024);
			const { conditions } = (
				spy.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ values: string[] }> };
				}
			).where;
			const sqlConds = conditions.filter((c): c is { values: string[] } => 'values' in c);
			const endDateValues = sqlConds.map((c) => c.values[1]).filter(Boolean);
			expect(endDateValues).toContain('2024-02-29');
		});

		it('computes correct December boundaries', async () => {
			const spy = vi.spyOn(mockState, 'findAll');
			await windowCleaningJobQueries.findByMonth(12, 2025);
			const { conditions } = (
				spy.mock.lastCall![0] as unknown as {
					where: { conditions: Array<{ values: string[] }> };
				}
			).where;
			const sqlConds = conditions.filter((c): c is { values: string[] } => 'values' in c);
			const allValues = sqlConds.flatMap((c) => c.values).filter(Boolean);
			expect(allValues).toContain('2025-12-01');
			expect(allValues).toContain('2025-12-31');
		});
	});

	describe('findByYear', () => {
		it('passes a compound and clause with full-year date range', async () => {
			await windowCleaningJobQueries.findByYear(2025);

			const arg = mockState.findAll.mock.lastCall![0] as unknown as {
				where: { type: string; conditions: unknown[] };
			};
			expect(arg.where.type).toBe('and');
		});

		it('throws for an invalid year (zero)', async () => {
			await expect(windowCleaningJobQueries.findByYear(0)).rejects.toThrow('Invalid year');
		});

		it('throws for a negative year', async () => {
			await expect(windowCleaningJobQueries.findByYear(-1)).rejects.toThrow('Invalid year');
		});

		it('throws for a year beyond 9999', async () => {
			await expect(windowCleaningJobQueries.findByYear(10000)).rejects.toThrow('Invalid year');
		});
	});
});
