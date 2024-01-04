const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const User = require('../models/user');

async function hashPasswordIfModified (user) {
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
}

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
    const accessToken = jwt.sign({ sub: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    return accessToken;
}

function generateRefreshToken (user) {
    const refreshToken = jwt.sign({ sub: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
    return refreshToken;
};

function decodeRefreshToken (refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    } catch (e) {
        throw new Error('Error refreshing access token');
    }
}

module.exports = {
    hashPasswordIfModified,
    findUserByCredentials,
    generateAccessToken,
    generateRefreshToken,
    decodeRefreshToken
};