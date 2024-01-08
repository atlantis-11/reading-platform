const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

function sendDevError (error, res) {
    res.status(error.statusCode).json({
        message: error.message,
        stack: error.stack,
        error: error
    });
}

function sendProdError (error, res) {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message
        });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Something went wrong'
        });
    }
}

function errorHandler (error, req, res, next) {
    error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV === 'development') {
        sendDevError(error, res);
    } else if (process.env.NODE_ENV === 'production')  {
        sendProdError(error, res);
    }

    logger.error(error);
}

module.exports = errorHandler;