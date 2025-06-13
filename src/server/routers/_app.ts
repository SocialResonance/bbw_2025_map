/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { postRouter } from './post';
import { userRouter } from './user';
import { journalClubRouter } from './journalClub'; // Add this import

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  post: postRouter,
  user: userRouter,
  journalClub: journalClubRouter, // Add the journal club router
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
