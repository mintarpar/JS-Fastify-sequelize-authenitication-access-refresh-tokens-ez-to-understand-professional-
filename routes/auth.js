const { signup, signin, signout, protectedRoute, refreshToken } = require("../controllers/authController");
const { protected } = require("../utils/protected");
async function authRoutes(fastify, options) {
    fastify.post("/signup", signup);
    fastify.post("/signin", signin);
    fastify.post("/signout", signout);
    fastify.get("/protected", { preHandler: protected }, protectedRoute);
    fastify.post("/refresh_token", refreshToken);
}
module.exports = authRoutes;
