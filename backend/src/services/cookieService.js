const { AuthenticationError } = require('../utils/customErrors');

function getRefreshTokenCookie(req) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        throw new AuthenticationError('No refresh token provided');
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