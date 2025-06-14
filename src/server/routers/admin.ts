import { adminProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

export const adminRouter = router({
  getUsers: adminProcedure.query(async () => {
    return await prisma.user.findMany();
  }),
  setUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.nativeEnum(Role),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          role: input.role,
        },
      });
    }),
});
