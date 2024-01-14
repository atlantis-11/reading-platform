const AppError = require('./AppError');

class AuthenticationError extends AppError {
    constructor(message, details = {}) {
        super(message, 401);
        this.details = details;
    }
}

module.exports = AuthenticationError;