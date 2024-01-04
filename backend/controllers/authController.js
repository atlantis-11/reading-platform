const User = require('../models/user');
const UsedRefreshToken = require('../models/usedRefreshToken');
const authServices = require('../services/authServices');

async function registerUser(req, res, next) {
    try {
        const user = new User(req.body);
        await authServices.hashPasswordIfModified(user);
        await user.save();

        const accessToken = authServices.generateAccessToken(user);
        const refreshToken = authServices.generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.status(201).send({ user, accessToken });
    } catch (e) {
        next(e);
    }
}

async function loginUser(req, res, next) {
    try {
        const user = await authServices.findUserByCredentials(req.body.usernameOrEmail, req.body.password);

        const accessToken = authServices.generateAccessToken(user);
        const refreshToken = authServices.generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.send({ user, accessToken });
    } catch (e) {
        next(e);
    }
}

async function refreshTokens(req, res, next) {
    try {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            throw new Error('No refresh token provided');
        }

        const { sub: userId } = authServices.decodeRefreshToken(refreshToken);

        if (await UsedRefreshToken.findOne({ token: refreshToken })) {
            throw new Error('Refresh token reuse detected');
        }

        const user = await User.findById(userId);
        // generate new access token and rotate refresh token
        const newAccessToken = authServices.generateAccessToken(user);
        const newRefreshToken = authServices.generateRefreshToken(user);

        // add refresh token to used tokens to prevent refresh token reuse
        await UsedRefreshToken.create({ userId, token: refreshToken });

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true });
        res.send({ newAccessToken });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens
};