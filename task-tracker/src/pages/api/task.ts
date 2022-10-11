import { NextApiHandler } from "next";
import { prisma } from "../../server/db/client";
import { producer } from "../../server/kafka";

// task tracker api
const handler: NextApiHandler = async (req, res) => {
  // take token from authorization header
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).send("Unauthorized");
    return;
  }

  // mark task as done
  if (req.method === "PUT") {
    // take task id from query string
    const taskId = req.query.id as string;

    // update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completed: true },
    });

    await producer.connect();
    await producer.send({
      topic: "task-topic",
      messages: [
        {
          value: JSON.stringify({
            type: "task-completed",
            payload: {
              id: task.id,
              title: task.title,
              userId: task.userId,
            },
          }),
        },
      ],
    });
    await producer.disconnect();

    res.status(200).json(task);
  }
};

export default handler;
