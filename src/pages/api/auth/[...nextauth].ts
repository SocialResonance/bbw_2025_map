import NextAuth, { type NextAuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../server/prisma';
import { env } from '../../../server/env';

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Add isAdmin to the session
        // @ts-expect-error - Property 'isAdmin' does not exist on type 'User | AdapterUser'.
        session.user.isAdmin = user.isAdmin || false;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

      if (!dbUser) {
        // This is a new user
        const adminCount = await prisma.user.count({ where: { isAdmin: true } });
        if (adminCount === 0) {
          // First user becomes admin
          await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
          });
        }
      } else {
        // Existing user, check if they are the first and no admin is set (e.g. if admin was manually removed)
        const adminCount = await prisma.user.count({ where: { isAdmin: true } });
        if (adminCount === 0) {
           await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true },
          });
        }
      }
      return true;
    },
  },
};

export default NextAuth(authOptions);
