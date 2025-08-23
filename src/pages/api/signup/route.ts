import { db } from "../../../lib/db"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"
import { prisma } from '../../../../lib/prisma'

export async function POST(req: Request) {
  const { email, password, name } = await req.json()

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "User exists" }, { status: 400 })

    const usernameBase = name?.toLowerCase().replace(/\s+/g, "") || email.split("@")[0];
    let username = usernameBase;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${usernameBase}${counter}`;
      counter++;
    }
  const hash = await bcrypt.hash(password, 10)
  const user = await db.user.create({
    data: { 
      email, 
      name, 
      username,
      passwordHash: hash 
    },
  })

  return NextResponse.json({ user })
}
