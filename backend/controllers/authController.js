const Joi = require('joi');
const User = require('../models/user');
const AppError = require('../utils/AppError');
const authService = require('../services/authService');
const cookieService = require('../services/cookieService');
const userLoginSchema = require('../utils/joiSchemas/userLoginSchema');

async function registerUser(req, res) {
    const user = new User(req.body);
    await user.save();
    // MongoServerError: E11000 duplicate key error collection
    // ValidationError

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.status(201).send({ user, accessToken });
}

async function loginUser(req, res) {
    Joi.assert(req.body, userLoginSchema);
    // ValidationError

    const user = await authService.findUserByCredentials(req.body.usernameOrEmail, req.body.password);

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.send({ user, accessToken });
}
 
async function logoutUser (req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);

    authService.removeRefreshToken(user, refreshToken);
    await user.save();

    cookieService.clearRefreshTokenCookie(res);
    res.sendStatus(204);
}

async function refreshTokens(req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);

    await authService.handleRefreshTokenReuse(user, refreshToken);

    authService.removeRefreshToken(user, refreshToken);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokensAndSave(user);

    cookieService.setRefreshTokenCookie(res, newRefreshToken);
    res.send({ newAccessToken });
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
};