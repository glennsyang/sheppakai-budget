import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.CategoryCreateArgs>({
  category: {
    one: {
      data: {
        name: 'String',
        updatedAt: '2022-10-22T23:31:25Z',
        transaction: {
          create: {
            description: 'String',
            amount: 9276070.952436997,
            date: '2022-10-22T23:31:25Z',
            updatedAt: '2022-10-22T23:31:25Z',
          },
        },
      },
    },
    two: {
      data: {
        name: 'String',
        updatedAt: '2022-10-22T23:31:25Z',
        transaction: {
          create: {
            description: 'String',
            amount: 3682914.8593905247,
            date: '2022-10-22T23:31:25Z',
            updatedAt: '2022-10-22T23:31:25Z',
          },
        },
      },
    },
  },
});

export const transactionOnly = defineScenario<Prisma.TransactionCreateArgs>({
  transaction: {
    shoe: {
      data: {
        amount: 100.0,
        description: 'expensive shoes',
        type: 'EXPENSE',
        date: new Date(),
      },
    },
  },
});

export type StandardScenario = typeof standard;
export type TransactionOnlyScenario = typeof transactionOnly;
