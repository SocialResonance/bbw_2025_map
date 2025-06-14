import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '~/pages/api/auth/[...nextauth]';
import type * as trpcNext from '@trpc/server/adapters/next';

interface CreateContextOptions {
  session: Session | null;
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: CreateContextOptions) {
  return {
    session: opts.session,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @see https://trpc.io/docs/v11/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<Context> {
  const session = await getServerSession(opts.req, opts.res, authOptions);

  return await createContextInner({
    session,
  });
}
