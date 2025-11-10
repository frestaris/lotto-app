import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
  creditCents?: number;
  provider?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password)
          throw new Error("Missing credentials");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found");
        if (!user.password) throw new Error("User does not have a password");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        const accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "1h" }
        );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          accessToken,
          creditCents: user.creditCents,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.user = user as AuthUser;
        token.user.provider = account?.provider || "credentials";
        token.user.accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "1h" }
        );
      }

      if (trigger === "update" && session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { creditCents: true, name: true, email: true, image: true },
        });

        if (dbUser && token.user) Object.assign(token.user, dbUser);
      }

      if (token.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.user.id },
          select: { creditCents: true, name: true, email: true, image: true },
        });

        if (dbUser && token.user) Object.assign(token.user, dbUser);
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        Object.assign(session.user, {
          id: token.user.id,
          name: token.user.name,
          email: token.user.email,
          image: token.user.image,
          creditCents: token.user.creditCents,
          provider: token.user.provider || "credentials",
          accessToken: token.user.accessToken,
        });
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
