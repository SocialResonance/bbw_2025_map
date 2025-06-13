import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { prisma } from '../prisma';

export const journalClubRouter = router({
  list: publicProcedure.query(async () => {
    return prisma.journalClub.findMany({
      include: {
        creator: {
          select: { name: true, image: true },
        },
      },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        latitude: z.number(),
        longitude: z.number(),
        meetingTime: z.string().min(1), // Or a more specific Zod schema for dates/times
        frequency: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, description, latitude, longitude, meetingTime, frequency } = input;
      const userId = ctx.session.user.id;

      return prisma.journalClub.create({
        data: {
          name,
          description,
          latitude,
          longitude,
          meetingTime,
          frequency,
          creatorId: userId,
        },
      });
    }),
});
