const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');

function getRefreshTokenCookie(req) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        throw new AppError('No refresh token provided', StatusCodes.UNAUTHORIZED);
    }
    return refreshToken;
}

function setRefreshTokenCookie(res, refreshToken) {
    res.cookie('refreshToken', refreshToken, { httpOnly: true });
}

function clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', { httpOnly: true });
}

module.exports = {
    getRefreshTokenCookie,
    setRefreshTokenCookie,
    clearRefreshTokenCookie
};