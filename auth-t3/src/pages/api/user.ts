import { NextApiHandler } from "next";
import { prisma } from "../../server/db/client";

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    // get user info by token from query string
    // return user info
    const user = await prisma.user.findFirst({
      where: { token: { some: { accessToken: req.query.token as string } } },
    });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).json(user);
  }
};

export default handler;
