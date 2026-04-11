import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { canAdminSignIn } from "@/lib/admins";

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
    })
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email;
      if (!email) {
        return false;
      }
      const picture = profile && "picture" in profile && typeof profile.picture === "string" ? profile.picture : null;

      return canAdminSignIn(email, {
        name: profile.name,
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
