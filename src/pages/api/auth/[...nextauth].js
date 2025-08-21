import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.username = user.username;
      session.user.imageUrl = user.imageUrl;
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Generate unique username
      let baseUsername = user.name?.toLowerCase().replace(/\s+/g, "") || "user";
      let finalUsername = baseUsername;

      let exists = await prisma.user.findUnique({ where: { username: finalUsername } });
      let counter = 1;
      while (exists) {
        finalUsername = `${baseUsername}${counter}`;
        exists = await prisma.user.findUnique({ where: { username: finalUsername } });
        counter++;
      }

      // Random password hash
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Update user with profile info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          username: finalUsername,
          passwordHash: hashedPassword,
          name: user.name,
          imageUrl: user.image,
        },
      });
    },
  },
});
