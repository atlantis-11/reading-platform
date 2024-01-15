const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');
const { validationResult } = require('express-validator');
const capitalizeFirstLetter = require('../utils/capitalizeFirstLetter');
const User = require('../models/user');
const { USERNAME_COLLATION } = require('../config/constants');
const { ValidationError, AuthenticationError } = require('../utils/customErrors');

async function createNewUser(data) {
    const user = new User(data);

    try {
        await user.save();
        return user;
    } catch (error) {
        const message = 'Error registering user';
        const details = {};

        if (error.name === 'MongoServerError' && error.code === 11000) {
            const key = Object.keys(error.keyValue)[0];
            details[key] = `${capitalizeFirstLetter(key)} is not unique`;
        } else if (error instanceof mongoose.Error.ValidationError) {
            for (const key in error.errors) {
                details[key] = error.errors[key].message;
            }
        } else {
            throw error;
        }

        throw new ValidationError(message, details);
    }
}

function validateLoginData(req) {
    const errors = validationResult(req).array();
    if (errors.length !== 0) {
        const details = errors.reduce((details, error) =>
            (details[error.path] = error.msg, details), {}
        );
        throw new ValidationError('Invalid login data', details);
    }
}

async function findUserByCredentials(usernameOrEmail, password) {
    let user = {};
    
    const isEmail = validator.isEmail(usernameOrEmail);
    if (isEmail) {
        user = await User.findOne({ email: usernameOrEmail.toLowerCase() });
    } else {
        user = await User.findOne({ username: usernameOrEmail }).collation(USERNAME_COLLATION);
    }

    const message = 'Invalid login credentials';
    const details = {};
    if (isEmail) {
        details.email = usernameOrEmail;
    } else {
        details.username = usernameOrEmail;
    }

    if (!user) {
        throw new AuthenticationError(message, details);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AuthenticationError(message, details);
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
            throw new AuthenticationError(message, { reason: error.message });
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
        throw new AuthenticationError('Refresh token reuse detected, all user\'s refresh tokens revoked', { userId: user._id });
    }
}

module.exports = {
    createNewUser,
    validateLoginData,
    findUserByCredentials,
    generateAccessToken,
    generateRefreshToken,
    generateTokensAndSave,
    decodeRefreshToken,
    findUserByRefreshToken,
    removeRefreshTokenAndSave,
    handleRefreshTokenReuse
};