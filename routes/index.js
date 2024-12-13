async function routes(fastify, options) {
  fastify.get("/", async (_request, reply) => {
      return "Hi!";
  });
}

module.exports = routes;
