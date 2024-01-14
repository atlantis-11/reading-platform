const logger = require('../utils/logger');
const { AppError, ValidationError, AuthenticationError } = require('../utils/customErrors');

function errorHandler(error, req, res, next) {
    logger.error(error);

    if (error instanceof ValidationError || 
        error instanceof AuthenticationError) {

        res.status(error.statusCode).json({
            message: error.message,
            details: error.details
        });
    } else if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message
        });
    } else {
        res.sendStatus(500);
    }
}

module.exports = errorHandler;