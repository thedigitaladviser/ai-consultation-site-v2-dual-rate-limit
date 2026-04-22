import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateAdminWithPassword, canAdminSignIn } from "@/lib/admins";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/sign-in",
    error: "/admin/sign-in"
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const admin = authenticateAdminWithPassword(email, password);
        if (!admin) {
          return null;
        }

        return {
          id: admin.email,
          email: admin.email,
          name: admin.name,
          image: admin.image
        };
      }
    })
  ],
  callbacks: {
    async signIn({ profile, user, account }) {
      const email = user?.email || profile?.email;
      if (!email) {
        return false;
      }

      if (account?.provider === "credentials") {
        return true;
      }

      const picture = profile && "picture" in profile && typeof profile.picture === "string" ? profile.picture : null;

      return canAdminSignIn(email, {
        name: profile?.name || null,
        image: picture
      });
    },
    async session({ session }) {
      if (session.user?.email) {
        session.user.email = session.user.email.toLowerCase();
      }

      return session;
    }
  }
};
