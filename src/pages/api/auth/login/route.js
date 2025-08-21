import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";

const prisma = new PrismaClient();

export async function POST(req) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // create session
  const cookieStore = cookies();
  const res = NextResponse.json({ message: "Login successful" });
  const session = await getIronSession({ req: { cookies: cookieStore }, res }, sessionOptions);

  session.user = { id: user.id, email: user.email, username: user.username };
  await session.save();

  return res;
}
