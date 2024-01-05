const User = require('../models/user');
const authService = require('../services/authService');
const cookieService = require('../services/cookieService');
const userLoginSchema = require('../joiSchemas/userLoginSchema');

async function registerUser(req, res, next) {
    try {
        const user = new User(req.body);
        await user.save();
        // MongoServerError: E11000 duplicate key error collection
        // ValidationError

        const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

        cookieService.setRefreshTokenCookie(res, refreshToken);
        res.status(201).send({ user, accessToken });
    } catch (e) {
        next(e);
    }
}

async function loginUser(req, res, next) {
    try {
        const validationResult = userLoginSchema.validate(req.body);
        if (validationResult.error) {
            throw validationResult.error;
        }

        const user = await authService.findUserByCredentials(req.body.usernameOrEmail, req.body.password);

        const { accessToken, refreshToken } = await authService.generateTokensAndSave(user);

        cookieService.setRefreshTokenCookie(res, refreshToken);
        res.send({ user, accessToken });
    } catch (e) {
        next(e);
    }
}
 
async function logoutUser (req, res, next) {
    try {
        const refreshToken = cookieService.getRefreshTokenCookie(req);
        //Error('No refresh token provided')

        const user = await authService.findUserByRefreshToken(refreshToken);
        // Error('Error decoding refresh token')
        // Error('No user corresponding to refresh token')

        authService.removeRefreshToken(user, refreshToken);
        await user.save();

        cookieService.clearRefreshTokenCookie(res);
        res.sendStatus(204);
    } catch (e) {
        next(e);
    }
}

async function refreshTokens(req, res, next) {
    try {
        const refreshToken = cookieService.getRefreshTokenCookie(req);
        // Error('No refresh token provided')

        const user = await authService.findUserByRefreshToken(refreshToken);
        // Error('Error decoding refresh token')
        // Error('No user corresponding to refresh token')

        await authService.handleRefreshTokenReuse(user, refreshToken);
        // Error('Refresh token reuse detected');

        authService.removeRefreshToken(user, refreshToken);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await authService.generateTokensAndSave(user);

        cookieService.setRefreshTokenCookie(res, newRefreshToken);
        res.send({ newAccessToken });
    } catch (e) {
        next(e);
    }
}

module.exports = {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
};