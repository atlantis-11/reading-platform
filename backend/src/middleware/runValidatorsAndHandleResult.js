const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/customErrors');

function handleValidationResult(errorMessage) {
    return (req, res, next) => {
        const errors = validationResult(req).array();
        if (errors.length !== 0) {
            const details = errors.reduce((details, error) =>
                (details[error.path] = error.msg, details), {}
            );
            throw new ValidationError(errorMessage, { details });
        } else {
            next();
        }
    };
}

module.exports = (validators, errorMessage) => {
    return [validators, handleValidationResult(errorMessage)];
};