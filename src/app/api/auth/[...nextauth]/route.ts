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
  creditCents?: number;
  provider?: string;
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
    async jwt({ token, user, account, trigger }) {
      // On first login
      if (user) {
        token.user = user as AuthUser;
        token.user.provider = account?.provider || "credentials";

        // Always sign an internal app token for API auth
        token.user.accessToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.NEXTAUTH_SECRET!,
          { expiresIn: "1h" }
        );
      }

      // Handle update trigger
      if (trigger === "update" && token.user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.user.id },
          select: {
            creditCents: true,
            name: true,
            email: true,
            image: true,
          },
        });

        if (dbUser) {
          token.user.creditCents = dbUser.creditCents;
          token.user.name = dbUser.name;
          token.user.email = dbUser.email;
          token.user.image = dbUser.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.user) {
        session.user.id = token.user.id;
        session.user.name = token.user.name;
        session.user.email = token.user.email;
        session.user.image = token.user.image;
        session.user.creditCents = token.user.creditCents;
        session.user.provider = token.user.provider || "credentials";
        session.user.accessToken = token.user.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
