const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');

async function findUserByCredentials (usernameOrEmail, password) {
    let user = {};
    
    if (validator.isEmail(usernameOrEmail)) {
        user = await User.findOne({ email: usernameOrEmail });
    } else {
        user = await User.findOne({ username: usernameOrEmail });
    }

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    return user;
};

function generateAccessToken (user) {
    return jwt.sign({ sub: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken (user) {
    return jwt.sign({ sub: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
};

async function generateTokensAndSave (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

function decodeRefreshToken (refreshToken) {
    try {
        return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (e) {
        throw new Error('Error decoding refresh token');
    }
}

async function findUserByRefreshToken (refreshToken) {
    const userId = decodeRefreshToken(refreshToken).sub;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('No user corresponding to refresh token');
    }
    return user;
}

function removeRefreshToken (user, refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
}

async function handleRefreshTokenReuse (user, refreshToken) {
    if (!user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = [];
        await user.save();
        throw new Error('Refresh token reuse detected, all refresh tokens revoked');
    }
}

module.exports = {
    findUserByCredentials,
    generateAccessToken,
    generateRefreshToken,
    generateTokensAndSave,
    decodeRefreshToken,
    findUserByRefreshToken,
    removeRefreshToken,
    handleRefreshTokenReuse
};