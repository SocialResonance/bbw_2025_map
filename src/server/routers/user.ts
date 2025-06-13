import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';
import { prisma } from '../prisma';

export const userRouter = router({
  list: adminProcedure.query(async () => {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
      },
    });
  }),
  setAdminStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        isAdmin: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const { userId, isAdmin } = input;
      // Prevent admin from removing their own admin status if they are the only admin
      if (prisma.user.count({ where: { isAdmin: true } }) === 1) {
        const userToUpdate = await prisma.user.findUnique({ where: { id: userId } });
        if (userToUpdate?.isAdmin && !isAdmin) {
          throw new Error('Cannot remove the last admin.');
        }
      }

      return prisma.user.update({
        where: { id: userId },
        data: { isAdmin },
        select: {
          id: true,
          isAdmin: true,
        },
      });
    }),
});
