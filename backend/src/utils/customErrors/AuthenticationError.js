const AppError = require('./AppError');

class AuthenticationError extends AppError {
    constructor(message, { details, context } = {}) {
        super(message, { statusCode: 401, details, context });
    }
}

module.exports = AuthenticationError;