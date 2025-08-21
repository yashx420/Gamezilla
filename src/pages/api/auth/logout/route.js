import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { sessionOptions } from "@/lib/session";
import { getIronSession } from "iron-session";

export async function POST(req) {
  const cookieStore = cookies();
  const res = NextResponse.json({ message: "Logged out" });
  const session = await getIronSession({ req: { cookies: cookieStore }, res }, sessionOptions);

  session.destroy();
  return res;
}
