const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');
const { ROLES, BOOK_STATUSES } = require('../config/constants');

const readingListEntrySchema = new mongoose.Schema({
    _id: false,
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: Object.values(BOOK_STATUSES),
            message: `Invalid status value, valid values: ${Object.values(BOOK_STATUSES).join(', ')}`
        }
    }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        index: {
            unique: true,
            collation: { locale: 'en', strength: 1 }
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
    },
    isProfilePublic: {
        type: Boolean,
        required: true,
        default: true
    },
    readingList: [readingListEntrySchema]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.query.byUsername = function (username) {
    return this.where({ username: new RegExp(username, 'i') });
};

userSchema.query.byEmail = function (email) {
    return this.where({ email: email.toLowerCase() });
};

const User = mongoose.model('User', userSchema);

module.exports = User;