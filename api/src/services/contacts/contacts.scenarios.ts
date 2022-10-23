import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.ContactCreateArgs>({
  contact: {
    john: {
      data: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'I love RedwoodJS',
      },
    },
  },
});

export type StandardScenario = typeof standard;
