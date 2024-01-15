const AppError = require('./AppError');

class NotFoundError extends AppError {
    constructor(message, { details, context } = {}) {
        super(message, { statusCode: 404, details, context });
    }
}

module.exports = NotFoundError;