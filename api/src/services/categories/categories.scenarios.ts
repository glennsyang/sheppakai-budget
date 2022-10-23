import type { Prisma } from '@prisma/client';

export const standard = defineScenario<Prisma.CategoryCreateArgs>({
  category: {
    one: { data: { name: 'String5674923', updatedAt: '2022-10-23T04:20:46Z' } },
    two: { data: { name: 'String1551727', updatedAt: '2022-10-23T04:20:46Z' } },
  },
});

export type StandardScenario = typeof standard;
