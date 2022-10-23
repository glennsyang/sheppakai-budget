import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: {
      data: {
        email: 'String1716236',
        hashedPassword: 'String',
        salt: 'String',
      },
    },
    two: {
      data: {
        email: 'String9068742',
        hashedPassword: 'String',
        salt: 'String',
      },
    },
  },
});

export type StandardScenario = typeof standard;
