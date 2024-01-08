const { StatusCodes } = require('http-status-codes');
const authService = require('../services/authService');
const cookieService = require('../services/cookieService');
const logger = require('../utils/logger');

async function registerUser(req, res) {
    const user = await authService.createNewUser(req.body);

    logger.info(`User with id='${user._id}' registered`);

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.status(StatusCodes.CREATED).send({ user, accessToken });
}

async function loginUser(req, res) {
    authService.validateLoginData(req.body);

    const user = await authService.findUserByCredentials(req.body.usernameOrEmail, req.body.password);

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    logger.info(`User with id='${user._id}' logged in`);

    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.send({ user, accessToken });
}
 
async function logoutUser (req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);
    await authService.removeRefreshTokenAndSave(user, refreshToken);

    logger.info(`User with id='${user._id}' logged out`);

    cookieService.clearRefreshTokenCookie(res);
    res.sendStatus(StatusCodes.NO_CONTENT);
}

async function refreshTokens(req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);

    await authService.handleRefreshTokenReuse(user, refreshToken);

    await authService.removeRefreshTokenAndSave(user, refreshToken);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokensAndSave(user);

    logger.info(`User with id='${user._id}' refreshed tokens`);

    cookieService.setRefreshTokenCookie(res, newRefreshToken);
    res.send({ newAccessToken });
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
};