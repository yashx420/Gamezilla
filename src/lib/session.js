import { getIronSession } from "iron-session";

export const sessionOptions = {
  password: process.env.SESSION_SECRET, // long random string in .env
  cookieName: "gamezilla_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}
