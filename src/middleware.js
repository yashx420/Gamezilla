import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function middleware(req) {
  const res = NextResponse.next();
  const session = await getIronSession({ req, res }, sessionOptions);

  if (!session.user && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"], // protect dashboard
};
