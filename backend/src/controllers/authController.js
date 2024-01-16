const _ = require('lodash');
const logger = require('../utils/logger');
const {
    createNewUser,
    validateLoginData,
    findUserByCredentials,
    generateTokensAndSave,
    findUserByRefreshToken,
    removeRefreshTokenAndSave,
    handleRefreshTokenReuse
} = require('../services/authService');
const {
    getRefreshTokenCookie,
    setRefreshTokenCookie,
    clearRefreshTokenCookie
} = require('../services/cookieService');

async function registerUser(req, res) {
    const user = await createNewUser({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });

    const { accessToken, refreshToken } = await generateTokensAndSave(user);

    const message = 'User registered successfully';
    logger.info(message, { userId: user._id });
    
    setRefreshTokenCookie(res, refreshToken);

    const userDto = _.pick(user, ['username', 'email']);
    res.status(201).send({ message, user: userDto, accessToken });
}

async function loginUser(req, res) {
    const user = await findUserByCredentials(req.body.usernameOrEmail, req.body.password);

    const { accessToken, refreshToken } = await generateTokensAndSave(user);

    const message = 'User logged in successfully';
    logger.info(message, { userId: user._id });

    setRefreshTokenCookie(res, refreshToken);

    const userDto = _.pick(user, ['username', 'email']);
    res.send({ message, user: userDto, accessToken });
}

async function logoutUser(req, res) {
    const refreshToken = getRefreshTokenCookie(req);

    const user = await findUserByRefreshToken(refreshToken);
    await removeRefreshTokenAndSave(user, refreshToken);

    const message = 'User logged out successfully';
    logger.info(message, { userId: user._id });

    clearRefreshTokenCookie(res);
    res.send({ message });
}

async function refreshTokens(req, res) {
    const refreshToken = getRefreshTokenCookie(req);

    const user = await findUserByRefreshToken(refreshToken);

    await handleRefreshTokenReuse(user, refreshToken);

    await removeRefreshTokenAndSave(user, refreshToken);
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokensAndSave(user);

    const message = 'User refreshed tokens successfully';
    logger.info(message, { userId: user._id });

    setRefreshTokenCookie(res, newRefreshToken);
    res.send({ message, accessToken: newAccessToken });
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
};