import prisma from "../../../../lib/prisma";
import bcrypt from "bcryptjs";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usernameBase = name?.toLowerCase().replace(/\s+/g, "") || email.split("@")[0];
    let username = usernameBase;
    let counter = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${usernameBase}${counter}`;
      counter++;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        passwordHash: hashedPassword,
      },
    });

    return res.status(201).json({ message: "User created", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
