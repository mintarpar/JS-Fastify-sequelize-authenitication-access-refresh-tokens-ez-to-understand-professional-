const { sign } = require("jsonwebtoken");

const createAccessToken = (id) => {
    return sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
};
const createRefreshToken = (id) => {
    return sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d", 
    });
};
const sendAccessToken = (reply, accessToken) => {
    reply.send({
        accesstoken: accessToken,
        message: "Sign in Successful",
        type: "success",
    });
};
const sendRefreshToken = (reply, refreshToken) => {
    reply.setCookie("refreshtoken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 90 * 24 * 60 * 60 * 1000, 
        path: "/",
    });
};
module.exports = {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,
};
