import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.ContactCreateArgs>({
  contact: {
    one: {
      data: {
        name: 'String',
        email: 'String',
        message: 'String',
        updatedAt: '2022-10-22T04:56:43Z',
      },
    },
    two: {
      data: {
        name: 'String',
        email: 'String',
        message: 'String',
        updatedAt: '2022-10-22T04:56:43Z',
      },
    },
  },
});

export type StandardScenario = typeof standard;
