const { compare, hash } = require("bcryptjs");
const { createAccessToken, createRefreshToken, sendAccessToken, sendRefreshToken } = require("../utils/tokens");
const User = require("../models/users");
const { verify } = require("jsonwebtoken");

const signup = async (request, reply) => {
    const { email, password } = request.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return reply.status(400).send({
            message: "User already exists",
            type: "error",
        });
    }
    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({
        email,
        password: hashedPassword,
    });
    return reply.status(201).send({
        message: "User registered successfully",
        type: "success",
        userId: newUser.id,
    });
};
///////////////////////////////////////////////////////////////////
const signin = async (request, reply) => {
    const { email, password } = request.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return reply.status(404).send({
            message: "User not found",
            type: "error",
        });
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
        return reply.status(401).send({
            message: "Invalid password",
            type: "error",
        });
    }
    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);

    user.refreshtoken = refreshToken;
    await user.save();

    sendAccessToken(reply, accessToken);
    sendRefreshToken(reply, refreshToken);
};
///////////////////////////////////////////////////////////////
const signout = async (request, reply) => {
    reply.clearCookie("refreshtoken", { path: "/" });
    return reply.status(200).send({
        message: "Signed out successfully",
        type: "success",
    });
};
/////////////////////////////////////////////////////////////////////
const protectedRoute = async (request, reply) => {
    try {
        const token = request.headers.authorization?.split(" ")[1];
        if (!token) {
            return reply.status(401).send({
                message: "No token provided",
                type: "error",
            });
        }
        const decoded = verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user) {
            return reply.status(404).send({
                message: "User not found",
                type: "error",
            });
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const accessTokenExpiresIn = decoded.exp - currentTime;
        const refreshToken = request.cookies.refreshtoken;
        if (!refreshToken) {
            return reply.status(401).send({
                message: "No refresh token provided",
                type: "error",
            });
        }
        const decodedRefresh = verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const refreshTokenExpiresIn = decodedRefresh.exp - currentTime;
        const formatTime = (seconds) => {
            const days = Math.floor(seconds / (24 * 60 * 60));
            const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${days} days, ${hours} hours, ${minutes} minutes`;
        };
        return reply.send({
            message: "You are logged in!",
            type: "success",
            user: {
                _id: user.id,
                email: user.email,
                verified: user.verified,
                accessTokenExpiresIn: formatTime(accessTokenExpiresIn),
                refreshTokenExpiresIn: formatTime(refreshTokenExpiresIn),
            },
        });
    } catch (error) {
        return reply.status(401).send({
            message: "Unauthorized",
            type: "error",
        });
    }
};
//////////////////////////////////////////////////////////////
const refreshToken = async (request, reply) => {
    const { refreshtoken } = request.cookies;
    if (!refreshtoken) {
        return reply.status(401).send({
            message: "No refresh token provided!",
            type: "error",
        });
    }
    try {
        const decoded = verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findOne({ where: { id: decoded.id } });
        if (!user || user.refreshtoken !== refreshtoken) {
            return reply.status(403).send({
                message: "Invalid refresh token!",
                type: "error",
            });
        }
        const accessToken = createAccessToken(user.id);
        sendAccessToken(reply, accessToken);
        return reply.status(200).send({
            message: "Access token refreshed successfully",
            type: "success",
        });
    } catch (error) {
        return reply.status(403).send({
            message: "Invalid or expired refresh token",
            type: "error",
        });
    }
};
module.exports = {
    signup,
    signin,
    signout,
    protectedRoute,
    refreshToken,
};
