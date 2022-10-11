import { NextApiHandler } from "next";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { prisma } from "../../server/db/client";
import { setCookie } from "cookies-next";
import { producer } from "../../server/kafka";

const handler: NextApiHandler = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { email: req.body.email },
  });
  if (!user) {
    res.status(404).send("User not found");
    return;
  }

  const passwordHash = await bcrypt.hash(req.body.password, user.salt);

  if (passwordHash !== user.passwordHash) {
    res.status(401).send("Incorrect password");
    return;
  }

  // create JWT token, save it in database and send it to the client
  const token = sign({ userId: user.id }, process.env.JWT_SECRET!);
  await prisma?.authToken.create({
    data: { accessToken: token, user: { connect: { id: user.id } } },
  });

  // set token in cookies
  setCookie("token", token, { req, res });

  res.status(200).json({ user, token });
};

export default handler;
