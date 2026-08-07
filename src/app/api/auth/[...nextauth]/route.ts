import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isApprovedZodaEmail } from "@/lib/auth";

const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing-google-client-secret",
      authorization: {
        params: {
          hd: "zoda.sg",
          prompt: "select_account"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return isApprovedZodaEmail(user.email);
    },
    async session({ session }) {
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
