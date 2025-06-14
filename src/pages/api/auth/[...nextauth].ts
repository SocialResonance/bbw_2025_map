import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const admin = await prisma.admin.findFirst();
      if (admin === null) {
        await prisma.admin.create({
          data: {
            userId: user.id,
          },
        });
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            role: Role.ADMIN,
          },
        });
      }

      const dbUser = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (session.user && dbUser) {
        session.user.role = dbUser.role;
        session.user.id = dbUser.id;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
