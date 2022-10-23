import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.TransactionCreateArgs>({
  transaction: {
    one: {
      data: {
        description: 'String',
        amount: 6876722.239510837,
        date: '2022-10-23T04:20:11Z',
        updatedAt: '2022-10-23T04:20:11Z',
      },
    },
    two: {
      data: {
        description: 'String',
        amount: 8734750.709285619,
        date: '2022-10-23T04:20:11Z',
        updatedAt: '2022-10-23T04:20:11Z',
      },
    },
  },
});

export type StandardScenario = typeof standard;
