import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

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

        // Return a plain object — not Prisma model — to satisfy NextAuth typing
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
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
      if (user) token.user = user;

      // Add access_token if using OAuth (Google)
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

  async session({ session, token }) {
  if (token?.user) {
    session.user = {
      ...session.user,
      ...token.user,
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
