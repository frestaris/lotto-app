import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // ✅ Google Login
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Email + Password Login
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

        // ✅ Generate our own access token (1h expiry)
        const accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.NEXTAUTH_SECRET!, // reuse your NextAuth secret
          { expiresIn: "1h" }
        );

        // ✅ Return a plain object (NextAuth expects this)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          accessToken, // 👈 add our token
        };
      },
    }),
  ],

  // ✅ Use JWT strategy so session persists in cookies — no DB calls needed
  session: {
    strategy: "jwt",
  },

  // ✅ Custom callbacks to persist user and access token
  callbacks: {
    async jwt({ token, user, account }) {
      // Attach user info on login
      if (user) token.user = user as AuthUser;

      // Add Google access token
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      // Add custom JWT from credentials login
      if (user && (user as AuthUser).accessToken) {
        token.accessToken = (user as AuthUser).accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user = {
          ...session.user,
          ...(token.user as AuthUser),
          accessToken: token.accessToken as string | undefined,
        };
      }
      return session;
    },
  },

  // ✅ Optional custom sign-in page
  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
