const mongoose = require('mongoose');
const _ = require('lodash');
const { ValidationError } = require('../utils/customErrors');

module.exports = (error, errorMessage) => {
    const details = {};

    if (error.name === 'MongoServerError' && error.code === 11000) {
        const key = Object.keys(error.keyValue)[0];
        details[key] = `${_.upperFirst(key)} is not unique`;
    } else if (error instanceof mongoose.Error.ValidationError) {
        for (const key in error.errors) {
            details[key] = error.errors[key].message;
        }
    } else {
        throw error;
    }

    throw new ValidationError(errorMessage, { details });
};