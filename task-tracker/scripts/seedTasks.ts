import { PrismaClient } from "@prisma/client";
import axios from "axios";

const main = async () => {
  const prisma = new PrismaClient();
  const tasks = await axios.get("https://jsonplaceholder.typicode.com/todos");
  const users = await prisma.user.findMany();

  for await (const task of tasks.data) {
    await prisma.task.create({
      data: {
        title: task.title,
        completed: task.completed,
        userId: users[Math.floor(Math.random() * users.length)].id,
      },
    });
  }
};

main();
