const AppError = require('./AppError');

class ValidationError extends AppError {
    constructor(message, { details, context } = {}) {
        super(message, { statusCode: 400, details, context });
    }
}

module.exports = ValidationError;