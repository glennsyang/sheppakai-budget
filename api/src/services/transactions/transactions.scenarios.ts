import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.TransactionCreateArgs>({
  transaction: {
    one: {
      data: {
        description: 'String',
        amount: 3964767.5822619987,
        type: 'EXPENSE',
        date: '2022-10-23T00:24:33Z',
        updatedAt: '2022-10-23T00:24:33Z',
      },
    },
    two: {
      data: {
        description: 'String',
        amount: 8323960.965194663,
        type: 'EXPENSE',
        date: '2022-10-23T00:24:33Z',
        updatedAt: '2022-10-23T00:24:33Z',
      },
    },
  },
});

export type StandardScenario = typeof standard;
