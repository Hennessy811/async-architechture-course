import { NextApiHandler } from "next";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { prisma } from "../../server/db/client";
// import {prisma}from '../'

const handler: NextApiHandler = async (req, res) => {
  const userSalt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(req.body.password, userSalt);

  const existingUser = await prisma.user.findFirst({
    where: { email: req.body.email },
  });

  if (existingUser) {
    res.status(409).send("User already exists");
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: req.body.email,
      passwordHash,
      salt: userSalt,
      name: req.body.name,
    },
  });

  if (!user) {
    res.status(500).send("User not created");
    return;
  }

  const token = sign({ userId: user.id }, process.env.JWT_SECRET!);
  await prisma?.authToken.create({
    data: {
      accessToken: token,
      user: { connect: { id: user.id } },
    },
  });

  // set token in cookies
  res.setHeader("Set-Cookie", `token=${token}; path=/; HttpOnly`);

  res.status(200).json({ user, token });
};

export default handler;
