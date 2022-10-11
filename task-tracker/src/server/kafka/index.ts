import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "auth-app",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "auth-group" });
