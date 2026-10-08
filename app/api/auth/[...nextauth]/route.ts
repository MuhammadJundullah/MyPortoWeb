import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      username?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
      username: { label: "Username atau email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Username or password missing.");
          return null;
        }

        try {
          const rawIdentifier = credentials.username.trim();
          const identifier = rawIdentifier.toLowerCase();
          const user = await prisma.users.findFirst({
            where: { OR: [{ username: identifier }, { username: rawIdentifier }, { email: identifier }] },
            select: { id: true, username: true, password: true, name: true, email: true },
          });

          if (!user) {
            console.error("User not found.");
            return null;
          }

          if (!user.password) {
            console.error("Password hash is missing for the user.");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.error("Invalid password.");
            return null;
          }

          return { id: String(user.id), name: user.name || user.username, username: user.username, email: user.email } as any;
        } catch (error) {
          console.error("Database error during authorization:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username || user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token?.id) {
          session.user.id = token.id as string;
        }
        if (token?.username) {
          session.user.username = token.username as string;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };
