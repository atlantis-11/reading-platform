const logger = require('../utils/logger');
const { AppError, InternalServerError } = require('../utils/customErrors');

function errorHandler(error, req, res, next) {
    logger.error(error);

    if (!(error instanceof AppError)) {
        error = new InternalServerError(); 
    }

    res.status(error.statusCode).json({
        message: error.message,
        details: error.details
    });
}

module.exports = errorHandler;