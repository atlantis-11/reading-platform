class AppError extends Error {
    constructor(message, { statusCode, details, context } = {}) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode || 500;
        this.details = details || undefined;
        this.context = context || undefined;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;