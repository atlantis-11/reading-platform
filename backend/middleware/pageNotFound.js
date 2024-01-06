const AppError = require('../utils/AppError');

module.exports = (res, req) => { throw new AppError('Page not found', 404) };