import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.TransactionCreateArgs>({
  transaction: {
    one: {
      data: {
        description: 'String',
        amount: 6611189.57123497,
        date: '2022-09-05T06:32:51Z',
        type: 'String',
        updatedAt: '2022-09-05T06:32:51Z',
      },
    },
    two: {
      data: {
        description: 'String',
        amount: 1756449.060906411,
        date: '2022-09-05T06:32:51Z',
        type: 'String',
        updatedAt: '2022-09-05T06:32:51Z',
      },
    },
  },
});

export type StandardScenario = typeof standard;
