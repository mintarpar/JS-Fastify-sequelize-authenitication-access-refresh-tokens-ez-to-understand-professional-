require("dotenv").config();
const fastify = require("fastify")();
const cookie = require("@fastify/cookie");
const { connectDB } = require("./db");

const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");

const port = process.env.PORT || 3001;

connectDB();

fastify.register(require("@fastify/formbody"));
fastify.register(cookie);

fastify.register(indexRoutes, { prefix: "/" });
fastify.register(authRoutes, { prefix: "/auth" });

const start = async() => {
     try { 
        await fastify.listen({ port, host: "127.0.0.1" });
        console.log(`Server listening at http://localhost:3001`);
        } catch(err) {
             console.error(err);
             process.exit(1);
}};
start();