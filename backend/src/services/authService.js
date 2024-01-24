const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const User = require('../models/userModel');
const { AuthenticationError } = require('../utils/customErrors');

async function createNewUser(data) {
    const user = new User(data);

    try {
        await user.save();
        return user;
    } catch (error) {
        const message = 'Error registering user';
        handleMongooseSaveErrors(error, message);
    }
}

async function findUserByCredentials(usernameOrEmail, password) {
    let user = {};
    
    const isEmail = validator.isEmail(usernameOrEmail);
    if (isEmail) {
        user = await User.findOne().byEmail(usernameOrEmail);
    } else {
        user = await User.findOne().byUsername(usernameOrEmail);
    }

    const message = 'Invalid login credentials';
    const context = {};
    if (isEmail) {
        context.email = usernameOrEmail;
    } else {
        context.username = usernameOrEmail;
    }

    if (!user) {
        throw new AuthenticationError(message, { context });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AuthenticationError(message, { context });
    }

    return user;
}

function generateAccessToken(user) {
    return jwt.sign({ sub: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
    return jwt.sign({ sub: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

async function generateTokensAndSave(user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken };
}

function decodeRefreshToken(refreshToken) {
    try {
        return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        const message = 'Error decoding refresh token';
        if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
            const details = { reason: error.message };
            throw new AuthenticationError(message, { details });
        } else {
            throw new AuthenticationError(message);
        }
    }
}

async function findUserByRefreshToken(refreshToken) {
    const userId = decodeRefreshToken(refreshToken).sub;
    const user = await User.findById(userId);
    if (!user) {
        throw new AuthenticationError('No user corresponding to the refresh token');
    }
    return user;
}

async function removeRefreshTokenAndSave(user, refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
    await user.save();
}

async function handleRefreshTokenReuse(user, refreshToken) {
    if (!user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = [];
        await user.save();
        const context = { userId: user._id };
        throw new AuthenticationError('Refresh token reuse detected, all user\'s refresh tokens revoked', { context });
    }
}

module.exports = {
    createNewUser,
    findUserByCredentials,
    generateAccessToken,
    generateRefreshToken,
    generateTokensAndSave,
    decodeRefreshToken,
    findUserByRefreshToken,
    removeRefreshTokenAndSave,
    handleRefreshTokenReuse
};