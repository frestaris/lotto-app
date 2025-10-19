import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
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
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user) throw new Error("No user found");
        if (!user.password) throw new Error("User does not have a password");

        const isValid = await compare(credentials!.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" }, // route handled by Better Auth UI
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
