const AppError = require('../utils/AppError');

function getRefreshTokenCookie(req) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        throw new AppError('No refresh token provided', 401);
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