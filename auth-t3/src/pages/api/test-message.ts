import { NextApiHandler } from "next";
import { producer } from "../../server/kafka";

const handler: NextApiHandler = async (req, res) => {
  await producer.connect();

  await producer.send({
    topic: "test",
    messages: [{ value: "Hello KafkaJS user!" }],
  });
  await producer.disconnect();
  res.status(200).send("ok");
  // check if app by its id exists and has a valid secret
  //
};

export default handler;
