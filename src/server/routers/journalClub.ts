import { protectedProcedure, publicProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import { z } from 'zod';

export const journalClubRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.journalClub.findMany();
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        lat: z.number(),
        lng: z.number(),
        frequency: z.string(),
        time: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.journalClub.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        lat: z.number(),
        lng: z.number(),
        frequency: z.string(),
        time: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.journalClub.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.journalClub.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
