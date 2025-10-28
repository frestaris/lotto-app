import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      creditCents?: number;
      provider?: string;
    };
  }

  interface User {
    creditCents?: number;
    provider?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      creditCents?: number;
      provider?: string;
    };
    accessToken?: string;
  }
}
