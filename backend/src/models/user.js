const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');
const { ROLES, USERNAME_COLLATION } = require('../config/constants');

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        index: {
            unique: true,
            collation: USERNAME_COLLATION
        },
        trim: true,
        minlength: [4, 'Username must be at least 4 characters long'],
        validate: {
            validator: (value) => value.match(/^\w+$/),
            message: 'Username must only contain letters, numbers and underscores',
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Invalid email address',
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    refreshTokens: [String],
    role: {
        type: String,
        required: true,
        enum: Object.values(ROLES),
        default: ROLES.USER
    }
}, {
    timestamps: true
});

schema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

const User = mongoose.model('User', schema);

module.exports = User;