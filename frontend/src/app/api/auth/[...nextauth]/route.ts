import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/connectDB";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await connectDB();

        let existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          // Create new user with provider info
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account?.provider || "NA",
            providerId: account?.providerAccountId,
          });
          console.log("✅ New user created:", existingUser.email);
        } else {
          console.log("✅ Existing user logged in:", existingUser.email);
        }

        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error("❌ Error in jwt callback:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
