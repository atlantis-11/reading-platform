const authService = require('../services/authService');
const cookieService = require('../services/cookieService');
const logger = require('../utils/logger');

async function registerUser(req, res) {
    const user = await authService.createNewUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    const message = 'User registered successfully';
    logger.info(message, { userId: user._id });
    
    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.status(201).send({ message, user, accessToken });
}


async function loginUser(req, res) {
    // uses express-validator's result
    authService.validateLoginData(req);

    const user = await authService.findUserByCredentials(req.body.usernameOrEmail, req.body.password);

    const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

    const message = 'User logged in successfully';
    logger.info(message, { userId: user._id });

    cookieService.setRefreshTokenCookie(res, refreshToken);
    res.send({ message, user, accessToken });
}
 
async function logoutUser(req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);
    await authService.removeRefreshTokenAndSave(user, refreshToken);

    const message = 'User logged out successfully';
    logger.info(message, { userId: user._id });

    cookieService.clearRefreshTokenCookie(res);
    res.send({ message });
}

async function refreshTokens(req, res) {
    const refreshToken = cookieService.getRefreshTokenCookie(req);

    const user = await authService.findUserByRefreshToken(refreshToken);

    await authService.handleRefreshTokenReuse(user, refreshToken);

    await authService.removeRefreshTokenAndSave(user, refreshToken);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokensAndSave(user);

    const message = 'User refreshed tokens successfully';
    logger.info(message, { userId: user._id });

    cookieService.setRefreshTokenCookie(res, newRefreshToken);
    res.send({ message, accessToken: newAccessToken });
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
};