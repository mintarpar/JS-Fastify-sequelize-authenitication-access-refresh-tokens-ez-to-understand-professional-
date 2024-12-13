const { verify } = require("jsonwebtoken");

const protected = async (request, reply) => {
    const authHeader = request.headers["authorization"];
    if (!authHeader) {
        return reply.status(401).send({
            message: "Authorization token required",
            type: "error",
        });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return reply.status(401).send({
            message: "Authorization token missing",
            type: "error",
        });
    }

    try {
        const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);
        request.user = decoded; 
    } catch (error) {
        return reply.status(401).send({
            message: "Invalid or expired token",
            type: "error",
        });
    }
};

module.exports = { protected };
