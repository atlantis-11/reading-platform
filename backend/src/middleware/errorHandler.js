const logger = require('../utils/logger');
const filterObjectByKeys = require('../utils/filterObjectByKeys');
const { AppError, ValidationError, AuthenticationError } = require('../utils/customErrors');

const detailsToExclude = ['userId'];

function errorHandler(error, req, res, next) {
    logger.error(error);

    if (error instanceof ValidationError || 
        error instanceof AuthenticationError) {

        res.status(error.statusCode).json({
            message: error.message,
            details: filterObjectByKeys(error.details, detailsToExclude)
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