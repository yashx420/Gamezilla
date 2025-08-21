// src/app/api/auth/signup/route.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

let prisma;
if (!global.prisma) global.prisma = new PrismaClient();
prisma = global.prisma;

export async function POST(req) {
  const { username, email, password } = await req.json();

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return NextResponse.json({ error: "Email or username already registered" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { username, email, passwordHash },
  });

  return NextResponse.json({ message: "User created" }, { status: 201 });
}
