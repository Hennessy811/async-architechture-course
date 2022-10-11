import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

console.log("Starting Kafka server...");

const kafka = new Kafka({
  clientId: "auth-app",
  brokers: ["localhost:9092"],
  logLevel: 2,
});

const consumer = kafka.consumer({ groupId: "auth-group" });

const main = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "auth-topic" });

  const prisma = new PrismaClient();

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value?.toString() ?? "null");
      const { type, payload } = data;

      if (type === "user-created") {
        console.log("User created event received", payload);
        await prisma.user.create({
          data: {
            email: payload.email,
            id: payload.id,
            name: payload.name,
            role: payload.role,
          },
        });
        console.log("User created in DB");
      } else if (type === "user-updated") {
        console.log("User updated event received", payload);
        await prisma.user.update({
          where: { id: payload.id },
          data: {
            email: payload.email,
            name: payload.name,
            role: payload.role,
          },
        });
        console.log("User updated in DB");
      }
    },
  });
};

main().catch(console.error);
