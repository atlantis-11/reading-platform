const mongoose = require('mongoose');
const _ = require('lodash');
const { ValidationError, DuplicateResourceError } = require('../utils/customErrors');

module.exports = (error, errorMessage) => {
    let errorClass;
    const details = {};

    if (error.name === 'MongoServerError' && error.code === 11000) {
        const key = Object.keys(error.keyValue)[0];
        details[key] = `${_.upperFirst(key)} is not unique`;
        errorClass = DuplicateResourceError;
    } else if (error instanceof mongoose.Error.ValidationError) {
        for (const key in error.errors) {
            details[key] = error.errors[key].message;
        }
        errorClass = ValidationError;
    } else {
        throw error;
    }

    throw new errorClass(errorMessage, { details });
};