import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export function CustomAdapter() {
  const base = PrismaAdapter(prisma);

  return {
    ...base,

    async createUser(user) {
      const { image, ...rest } = user;

      let baseUsername =
        user.name?.toLowerCase().replace(/\s+/g, "") ||
        user.email?.split("@")[0] ||
        "user";
      let finalUsername = baseUsername;

      let exists = await prisma.user.findUnique({
        where: { username: finalUsername },
      });
      let counter = 1;
      while (exists) {
        finalUsername = `${baseUsername}${counter}`;
        exists = await prisma.user.findUnique({
          where: { username: finalUsername },
        });
        counter++;
      }

      // random password for Google users
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Create user
      return prisma.user.create({
        data: {
          ...rest,
          username: finalUsername,
          passwordHash: hashedPassword,
          imageUrl: image, 
        },
      });
    },
  };
}
