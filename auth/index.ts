import Fastify from 'fastify';
import { prisma } from './src/db';

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    await prisma.$disconnect();
    fastify.log.error(err);
    process.exit(1);
  }
};
start().then(async () => {
  await prisma.$disconnect();
});
