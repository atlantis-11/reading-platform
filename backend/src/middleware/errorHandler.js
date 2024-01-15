const logger = require('../utils/logger');
const { AppError } = require('../utils/customErrors');

function errorHandler(error, req, res, next) {
    logger.error(error);

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            message: error.message,
            details: error.details
        });
    } else {
        res.sendStatus(500);
    }
}

module.exports = errorHandler;