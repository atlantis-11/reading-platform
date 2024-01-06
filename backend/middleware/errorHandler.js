const mongoose = require('mongoose');
const Joi = require('joi');
const AppError = require('../utils/AppError');

function sendDevError (error, res) {
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        error: error
    });
}

function sendProdError (error, res) {
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
    }
}

function duplicateKeyError (error) {
    return new AppError(`${Object.keys(error.keyValue)[0]} is not unique`, 400);
}

function mongooseValidationError (error) {
    return new AppError(error.message, 400);
}

function joiValidationError (error) {
    return new AppError(error.details.map(item => item.message).join(', '), 400);
}

function errorHandler (error, req, res, next) {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    const nodeEnv = process.env.NODE_ENV || 'production';

    if (nodeEnv === 'development') {
        sendDevError(error, res);
    } else if (nodeEnv === 'production')  {
        if (error.name === 'MongoServerError' && error.code === 11000) error = duplicateKeyError(error);
        if (error instanceof mongoose.Error.ValidationError) error = mongooseValidationError(error);
        if (Joi.isError(error)) error = joiValidationError(error);

        sendProdError(error, res);
    }
}

module.exports = errorHandler;