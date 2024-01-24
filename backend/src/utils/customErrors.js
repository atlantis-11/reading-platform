const { getReasonPhrase } = require('http-status-codes');

class AppError extends Error {
    constructor(message, { statusCode, details, context } = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        this.details = details;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
}

function createErrorClass(statusCode, className) {
    const errorClass = class extends AppError {
        constructor(message = getReasonPhrase(statusCode), { details, context } = {}) {
            super(message, { statusCode, details, context });
        }
    };
    return Object.defineProperty(errorClass, 'name', { value: className });
}

module.exports = {
    AppError,
    ValidationError: createErrorClass(400, 'ValidationError'),
    AuthenticationError: createErrorClass(401, 'AuthenticationError'),
    AuthorizationError: createErrorClass(403, 'AuthorizationError'),
    NotFoundError: createErrorClass(404, 'NotFoundError'),
    InternalServerError: createErrorClass(500, 'InternalServerError')
};