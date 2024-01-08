const jwt = require('jsonwebtoken');
const validator = require('validator');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/user');
const userLoginSchema = require('../utils/joiSchemas/userLoginSchema');
const AppError = require('../utils/AppError');

async function createNewUser (data) {
    const user = new User(data);

    try {
        await user.save();
        return user;
    } catch (error) {
        let message = 'Error registering user';

        if (error.name === 'MongoServerError' && error.code === 11000) {
            // duplicate key error
            message += ', ' + `${[...Object.entries(error.keyValue)[0]].join('=')} is not unique`;
        } else if (error instanceof mongoose.Error.ValidationError) {
            message += ', ' + error.message;
        }

        throw new AppError(message, StatusCodes.UNAUTHORIZED);
    }
}

function validateLoginData (data) {
    try {
        Joi.assert(data, userLoginSchema);
    } catch (error) {
        throw new AppError(error.details.map(item => item.message).join(', '), StatusCodes.UNAUTHORIZED);
    }
}

async function findUserByCredentials (usernameOrEmail, password) {
    let user = {};
    
    const isEmail = validator.isEmail(usernameOrEmail);
    if (isEmail) {
        user = await User.findOne({ email: usernameOrEmail });
    } else {
        user = await User.findOne({ username: usernameOrEmail });
    }

    const errorMsg = `Invalid credentials for ${isEmail ? 'email' : 'username'}: ${usernameOrEmail}`;

    if (!user) {
        throw new AppError(errorMsg, StatusCodes.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError(errorMsg, StatusCodes.UNAUTHORIZED);
    }

    return user;
}

function generateAccessToken (user) {
    return jwt.sign({ sub: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken (user) {
    return jwt.sign({ sub: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
}

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
        if (e.name === 'TokenExpiredError' || e.name === 'JsonWebTokenError') {
            throw new AppError(`Error decoding refresh token: ${e.message}`, StatusCodes.UNAUTHORIZED);
        } else {
            throw new AppError('Error decoding refresh token', StatusCodes.UNAUTHORIZED);
        }
    }
}

async function findUserByRefreshToken (refreshToken) {
    const userId = decodeRefreshToken(refreshToken).sub;
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('No user corresponding to refresh token', StatusCodes.UNAUTHORIZED);
    }
    return user;
}

async function removeRefreshTokenAndSave (user, refreshToken) {
    user.refreshTokens = user.refreshTokens.filter(rt => rt !== refreshToken);
    await user.save();
}

async function handleRefreshTokenReuse (user, refreshToken) {
    if (!user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = [];
        await user.save();
        throw new AppError(`Refresh token reuse detected for user with id='${user._id.toString()}', all refresh tokens revoked`, StatusCodes.UNAUTHORIZED);
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