import { NextApiHandler } from "next";
import { prisma } from "../../server/db/client";
import { producer } from "../../server/kafka";

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    // get user info by token from query string
    // return user info

    // take token from authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }

    const user = await prisma.user.findFirst({
      where: { token: { some: { accessToken: token } } },
    });
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.status(200).json(user);
  } else if (req.method === "PUT") {
    // update user
    // take token from authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }

    const user = await prisma.user.findFirst({
      where: { token: { some: { accessToken: token } } },
    });

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      },
    });

    await producer.connect();
    await producer.send({
      topic: "auth-topic",
      messages: [
        {
          value: JSON.stringify({
            type: "user-updated",
            payload: {
              id: updatedUser.id,
              email: updatedUser.email,
              name: updatedUser.name,
              role: updatedUser.role,
            },
          }),
        },
      ],
    });
    await producer.disconnect();

    res.status(200).json(updatedUser);
  }
};

export default handler;
