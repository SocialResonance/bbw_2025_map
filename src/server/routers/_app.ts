/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory, publicProcedure, router } from '../trpc';
import { adminRouter } from './admin';
import { journalClubRouter } from './journalClub';

export const appRouter = router({
  healthcheck: publicProcedure.query(() => 'yay!'),

  admin: adminRouter,
  journalClub: journalClubRouter,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
